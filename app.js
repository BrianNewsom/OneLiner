var express = require('express');
var shortid = require('shortid');
var _ = require('lodash');
var app = express();
var http = require("http").Server(app);
var io = require('socket.io')(http);
var questions = require("./data/questions.json");
var port = process.env.PORT || 3000;

app.use(express.static('dist'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

function getRandomQuestion() {

    var min = 0;
    var max = questions.length;
    var id = Math.floor(Math.random() * (max - min)) + min;
    return questions[id];

}

var createFunctionSignature = function (inputArray) {

  if(!inputArray) return "";
  var functionSignature = "";

  for(var i = 0; i < inputArray.length; i++) {

    functionSignature += "var" + (i+1) + ",";

  }

  return functionSignature.substring(0, functionSignature.length - 1);

}

var createInputParameters = function (inputArray) {

  if(!inputArray) return "";
  var inputParameters = "";

  for(var i = 0; i < inputArray.length; i++) {
    
      inputParameters += JSON.stringify(inputArray[i]) + ",";

  }
  return inputParameters.substring(0, inputParameters.length-1);

}

var playerQueue = [];
var gameSessions = [];

http.listen(port, function() {
  console.log('listening on *:', port);
});

io.on('connection', function(socket) {

  console.log(socket.id + ' connected');

  var matchPlayer = function() {
    
    if( playerQueue.length > 0 ) {

    // Get the first player in the queue.
    var firstPlayerSocket = playerQueue.shift();

    // Create a session object.
    var sessionObject = {id: shortid.generate(), player1: firstPlayerSocket, player2: socket, question: getRandomQuestion()};
    gameSessions.push(sessionObject);

    // Remove "test_cases" from question object so front-end won't see test-cases.
    var questionObject = JSON.parse(JSON.stringify(sessionObject.question));
    questionObject.test_data = questionObject.test_cases[0];
    delete questionObject.test_cases;

    // Inform players in the session.
    firstPlayerSocket.emit("match_made", { session_id: sessionObject.id, opponent_id: sessionObject.player2.id, question: questionObject });
    socket.emit("match_made", { session_id: sessionObject.id, opponent_id: sessionObject.player1.id, question: questionObject });

  } else {

    playerQueue.push(socket);

  }
    
  }
  
  matchPlayer();


  socket.on("requeue", function() {
    
    matchPlayer();
    
  });
  
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
    try {

        var fn = new Function(createFunctionSignature(gameSession.question.test_cases[0].input), packet.code);

        for(var i=0; i < gameSession.question.test_cases.length; i++) {

            var test_case = gameSession.question.test_cases[i];

            var actualValue = eval("fn(" + createInputParameters(test_case.input) + ")");
            if(actualValue != test_case.output) {
              
                var debug_info = {"submitter": socket.id, "actual_value": actualValue, "expected_value": test_case.output, "input_value": test_case.input};
              
                gameSession.player1.emit("incorrect_answer", debug_info);
                gameSession.player2.emit("incorrect_answer", debug_info);
                return;
            }
        };
      }
    catch(exception) {
      
      var debug_info = {"submitter": socket.id, "actual_value": exception.message, "expected_value": test_case.output, "input_value": test_case.input}
      
        gameSession.player1.emit("incorrect_answer", debug_info);
        gameSession.player2.emit("incorrect_answer", debug_info);
        return;
    }

    console.log("we have a winner");
    // We have a winner!
    var gameOverObject = {winner: socket.id, code: packet.code};
    gameSession.player1.emit("game_over", gameOverObject);
    gameSession.player2.emit("game_over", gameOverObject);
    _.remove(gameSessions, gameSession);

  });

  socket.on("disconnect", function() {

      _.remove(playerQueue, socket);
      console.log(socket.id + " is dead");

  });

});
