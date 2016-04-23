var usergrid = require('usergrid');
var express = require('express');
var bodyParser = require('body-parser')
var Promise = require('bluebird');

var client = new usergrid.client({
  orgName: 'ketsler',
  appName: 'sandbox',
  logging: true
});


var app = express();
var router = express.Router();

app.use(bodyParser.json());
app.set('query parser', 'simple');

var movieKeys = ['title', 'year', 'actors'];
function isValidMovie(movie) {
  for (var i = 0; i < movieKeys.length; i++) {
    if (!(movieKeys[i] in movie)) {
      console.log("movie missing key " + movieKeys[i]);
      return false;
    }
  };

  if (!Array.isArray(movie.actors)) {
    console.log("movie.actors is not array");
    return false;
  }

  if (movie.actors.length < 1) {
    console.log("movie.actors is empty");
    return false;
  }

  return true;
}

function getMoveByTitle(title) {
  var movieOptions = {
    endpoint: "movies",
    qs: {ql: "title = '" + title + "'"}
  };
  return new Promise(function(resolve, reject) {
    client.request(movieOptions, function (error, response) {
      if (error) {
        var rejectBody = {error: {'type': 400, 'message': 'unable to process request', 'body': error}};
        reject(rejectBody);
      } else if (response.count < 1) {
        var rejectBody = {error: {'type': 404, 'message': 'movie not found'}};
        reject(rejectBody);
      }
      else {
        resolve(response.entities[0]);
      }
    });
  });
}

function getReviewsForMovie(movie) {
  var reviewsOptions = {
    endpoint:"reviews",
    qs:{ql:"movie = '" + movie.title + "'"}
  };
  return new Promise(function(resolve, reject) {
    client.request(reviewsOptions, function (error, response) {
      if (error){
        reject();
      } else {
        movie.reviews = response.entities;
        resolve(movie);
      }
    });
  });
}


router.use(function(req, res, next) {
  next();
});

router.get('/movies/:title', function(req, res) {
  var showReviews = req.query.reviews;

  getMoveByTitle(req.params.title).then(function(movie) {
    if(showReviews) {
      return getReviewsForMovie(movie);
    }
    else {
      res.status(200).json(movie);
      res.end();
    }
  }).then(function(movieWithReviews) {
    res.status(200).json(movieWithReviews);
    res.end();
  }).catch(function(err) {
    var error = err.error;
    res.status(error.type).json(err);
    res.end();
  });
});

router.route('/movies')
    .get(function(req, res) {
      console.log("normal get");
      var showReviews = req.query.reviews;
      client.createCollection({type:'movies'}, function (err, movies) {
        if (err) {

        }
        else {
          var allMovies = [];
          while(movies.hasNextEntity()) {
            //get a reference to the dog
            var movie = movies.getNextEntity().get();

            allMovies.push(movie);
          }
          if (showReviews) {
            Promise.map(allMovies, function(movie) {
              return getReviewsForMovie(movie)
            }).then(function (moviesWithReviews) {
              res.status(200).json(moviesWithReviews);
              res.end();
            }).catch(function (e) {
              res.status(400).json(e);
              res.end();
            });
          }
          else {
            res.status(200).json(allMovies);
            res.end();
          }
        }
      });
    })
    .post(function(req, res) {
      client.createEntity({type:'movies'}, function (err, movie) {
        if (err) {

        }
        else {
          if (isValidMovie(req.body)) {
            movie.set(req.body);
            movie.save(function(err){
              if (err) {

              }
              else {
                res.json(movie.get());
                res.end();
              }
            });
          }
          else {
            res.status(400).json({error: 'invalid movie object'});
            res.end();
          }
        }
      });
    });

router.route('/movies/:id')
    .get(function(req, res) {
      var options = {type: 'movies', uuid: req.params.id};
      client.createEntity(options, function (err, movie) {
        if (err) {
          res.status(404).json({error: 'movie not found'});
          res.end();
        }
        else {
          res.status(200).json(movie.get());
          res.end();
        }
      });
    })
    .delete(function(req, res) {
      var options = {type: 'movies', uuid: req.params.id};
      client.createEntity(options, function (err, movie) {
        if (err) {
          res.status(404).json({error: 'movie not found'});
          res.end();
        }
        else {
          res.status(200).json(movie.get());
          res.end();
          movie.destroy(function(err){
            if (err){

            }
            else {
              movie = null;
            }
          });
        }
      });
    });

app.use('', router);

var port = process.env.PORT || 9000;
console.log('assignment5 is listening on port ' + port);
app.listen(port);
