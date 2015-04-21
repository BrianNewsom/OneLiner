var express = require('express');
var shortid = require('shortid');
var _ = require('lodash');
var app = express();
var http = require("http").Server(app);
var io = require('socket.io')(http);
var questions = require("./data/questions.json");

app.use(express.static('dist'));


app.get('/', function(req, res){
  res.sendFile(__dirname + 'index.html');
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
    var sessionObject = {id: shortid.generate(), player1: firstPlayerSocket, player2: socket, question: getRandomQuestion()};
    gameSessions.push(sessionObject);

    // Remove "test_cases" from question object so front-end won't see test-cases.
    var questionObject = JSON.parse(JSON.stringify(sessionObject.question));
    questionObject.test_data = questionObject.test_cases[0];
    delete questionObject.test_case;

    // Inform players in the session.
    firstPlayerSocket.emit("match_made", { session_id: sessionObject.id, opponent_id: sessionObject.player2.id, question: questionObject });
    socket.emit("match_made", { session_id: sessionObject.id, opponent_id: sessionObject.player1.id, question: questionObject });

  } else {

    playerQueue.push(socket);

  }


  socket.on("submit_answer", function(packet) {

    console.log("Received an answer: " + JSON.stringify(packet));

    // if client doesn't provide required fields, ignore the package.
    if(!packet.session_id || !packet.code)
      return;

    var gameSession = _.find(gameSessions, function(item){ return item.id == packet.session_id; });
    if(!gameSession)
        return;

    // Test the code.
    // TODO: add some logic to remove potential malicious code.
    var fn = new Function('input', 'return ' + packet.code);
    for(var i=0; i < gameSession.question.test_cases.length; i++) {

        var test_case = gameSession.question.test_cases[i];

        var actualValue = fn(test_case.input);
        if(actualValue != test_case.output) {
            console.log(test_case);
            socket.emit("incorrect_answer", {"expected_value": test_case.output, "input_value": test_case.input, "actual_value": actualValue});
            return;
        }
    };

    console.log("we have a winner");
    // We have a winner!
    var gameOverObject = {winner: socket.id, code: packet.code};
    socket.emit("game_over", gameOverObject);
    gameSession.player2.emit("game_over", gameOverObject);
    _.remove(gameSessions, gameSession);

  });

  socket.on("disconnect", function() {

      _.remove(playerQueue, socket);
      console.log(socket.id + " is dead");

  });

});
