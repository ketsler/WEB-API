const http = require('http');
const express = require('express');
var app = express();


app.get('/gets', function(req,res){

    var requestMETHOD = req.method;
    res.set('Content-Type', 'text/html');
    res.send('Successful ' + requestMETHOD + ' request!');

});

app.post('/posts', function(req, res){

    var requestMETHOD = req.method;
    res.set('Content-Type', 'text/html');
    res.send('Successful ' + requestMETHOD + ' request!');

});

app.put('/puts', function(req, res){

    var requestMETHOD = req.method;
    res.set('Content-Type', 'text/html');
    res.send('Successful ' + requestMETHOD + ' request!');

});


app.delete('/deletes', function(req, res){
    var requestMETHOD = req.method;
    res.set('Content-Type', 'text/html');
    res.send('Successful ' + requestMETHOD + ' request!');

});

app.use('*', function(req, res, next){
    var err = new Error();
    err.status = 404;
    err.message = "There is an error!";
    var requestMETHOD = req.method;
    res.send('Cannot process: ' + requestMETHOD );
    //next(err);
});

app.listen(1337);
console.log("Server up and running");