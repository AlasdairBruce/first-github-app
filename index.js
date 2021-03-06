var createHandler = require('github-webhook-handler');
var http = require('http');

var handler = createHandler({
  path: '/',
  secret: 'myhashsecret'
});

handler.on('issues', function (event) {
  console.log('Received an issue event for %s action=%s: #%d %s',
              event.payload.repository.name,
              event.payload.action,
              event.payload.issue.number,
              event.payload.issue.title)
});

http.createServer(function (req, res) {
  handler(req, res, function (err) {
    res.statusCode = 404
    res.end('no such location')
  });
}).listen(7777);

var createApp = require('github-app');
var fs = require('fs');

var app = createApp({
  id: process.env.APP_ID,
  cert: process.env.PRIVATE_KEY || fs.readFileSync('private-key.pem')
});

handler.on('error', function (err) {
  console.error('Error:', err.message)
});

handler.on('issues', function (event) {
  console.log("EVENT", event);
  if (event.payload.action === 'opened') {
    var installation = event.payload.installation.id;
    app.asInstallation(installation).then(function (github) {
      github.issues.createComment({
        owner: event.payload.repository.owner.login,
        repo: event.payload.repository.name,
        number: event.payloadd.issue.number,
        body: 'Welcome...'
      });
    });
  }
});
