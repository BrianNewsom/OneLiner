var express = require('express');
var shortid = require('shortid');
var _ = require('lodash');
var app = express();
var http = require("http").Server(app);
var io = require('socket.io')(http);
var questions = require("../data/questions.json");

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

function getRandomQuestion() {

    var min = 0;
    var max = questions.length;
    var id = Math.floor(Math.random() * (max - min)) + min;
    return questions[id];

}

// MODULE HERE. refactor here

var playerQueue = [];
var gameSessions = [];

// END MODULE

http.listen(3000, function(){
  console.log('listening on *:3000');
});

io.on('connection', function(socket) {

  console.log(socket.id + ' connected');

  if( playerQueue.length > 0 ) {

    // Get the first player in the queue.
    var firstPlayerSocket = playerQueue.shift();

    // Create a session object.
    var sessionObject = {id: shortid.generate(), player1: firstPlayerSocket.id, player2: socket.id, question: getRandomQuestion()};
    gameSessions.push();

    // Remove "test_cases" from question object so front-end won't see test-cases.
    var questionObject = JSON.parse(JSON.stringify(sessionObject.question));
    delete questionObject.test_cases;

    // Inform players in the session.
    firstPlayerSocket.emit("match_made", { session_id: sessionObject.id, opponent_id: sessionObject.player2, question: questionObject });
    socket.emit("match_made", { session_id: sessionObject.id, opponent_id: sessionObject.player1, question: questionObject });

  } else {

    playerQueue.push(socket);

  }


  socket.on("submit_answer", function(packet) {

    // if client doesn't provide packet, ignore the request.
    if(!packet.session_id)
      return;



  });

  socket.on("disconnect", function() {

      _.remove(playerQueue, socket);
      console.log(socket.id + " is dead");

  });

});
