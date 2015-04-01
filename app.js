var express = require('express');
var questions = require('./data/questions.json');
var app = express();

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.get('/api/question/random', function(req, res) {
    var min = 0;
    var max = questions.length;
    var id = Math.floor(Math.random() * (max - min)) + min;
    console.log('Getting question id: ' + id);
    res.send(questions[id]);

});

app.get('/api/question/:id', function(req, res) {
    try{
        if(!questions[req.params.id]){
            throw("ID parameter must be integer and within the bounds of the array.")
        }
        res.send(questions[req.params.id]);
    }catch(e){
        console.log(e);
        res.send({"error": e})
    }
});


var server = app.listen(3000 || process.env.PORT , function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('App listening at http://%s:%s', host, port);

});
