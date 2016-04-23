var express = require('express');
var app = express();
var basicAuth = require('basic-auth-connect');
var github = initGithub();

app.get('/oauth', function (request, response) {
  var username = request.query.username || 'ketsler';
  var result = github.repos.getFromUser({
    user: username
  }, function(err, res) {
    response.send(res);
  });
});

var auth = basicAuth('username', 'password');
app.get('/basic', auth, function (request, response) {
  var username = request.query.username || 'ketsler';
  var result = github.repos.getFromUser({
    user: username
  }, function(err, res) {
    response.send(res);
  });
});

app.listen(process.env.PORT || 9000);
console.log('assignment3 listening');

function initGithub(username) {

  var githubApi = require("github");
  var github = new githubApi({
      version: "3.0.0"
  });

  var token = "atoken";

  github.authenticate({
      type: "oauth",
      token: token
  });

  return github;
}