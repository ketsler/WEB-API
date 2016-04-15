/*  Kyle Etsler 
	CSCI-3800 WEB API
	Assignment 4 
	Spring 2016
	Assignment_4.js: Program for requests to create, delete, and get list of movies.
*/


//requires
var express = require('express');
var run = express();
var request = require('request');
var usergrid = require('usergrid');
var client = new usergrid.client({
	name:'ketsler',
	application: 'sandbox',
});

/*Using the path at the end of the URL, these three functions of run will:
		-retrieve current movie entries and display them (method:GET, URLL /movies)
		-create new movie entrie (method:POST, URL:/new)
		-delete current movie entry (method:DELETE, URL:/delete)
*/

run.get('/movies', function(req, res){

    var options = {
        url: "https://api.usergrid.com/ketsler/sandbox/" + req.originalUrl
    };

    function callback(err, response, body) {
        if (!err && response.statusCode == 200) {
            var info = JSON.parse(body);
            res.send(info);
        }
    }
    request(options, callback);

})

run.post('/create', function (req, res){
    if(!req.query.name || !req.query.release || !req.query.actors) {
        res.send('You need to give a movie name, year and multiple actors');
    } else {
        var options = {
            type: 'movies',
            name: req.query.name,
            release: req.query.release,
            actors: req.query.actors,
            getOnExist: true
        };
        client.createEntity(options, function (err, data) {
            if (err) {
                res.send('Unable to create the entity')
            } else {
                var options = {
                    url: "https://api.usergrid.com/ketsler/sandbox/movies"
                };

                function callback(error, response, body) {
                    if (!error && response.statusCode == 200) {
                        var info = JSON.parse(body);
                        res.send(info);
                    }
                }
                request(options, callback);
            }
        });
    }
})

run.delete('/delete', function (req, res) {
    var options = {
        type:'movies',
        name: req.query.name
    }
    client.getEntity(options, function(err, movie){
        if (err){
            res.send("Error locating entity, might not exist");
        } else {
            movie.destroy(function(err){
                if (err){
                    //the entity could not be deleted
                    res.send('Error deleting entity');
                } else {
                    movie = null;
                    var options = {
                        url: "https://api.usergrid.com/ketsler/sandbox/movies"
                    };

                    function callback(error, response, body) {
                        if (!error && response.statusCode == 200) {
                            var info = JSON.parse(body);
                            res.send(info);
                        }
                    }
                    request(options, callback);
                }
            });
        }
    });
})

run.listen(9000);
console.log("server running on http://localhost:9000");