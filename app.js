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

//    if(typeof(inputArray[i]) == "object")
      inputParameters += JSON.stringify(inputArray[i]) + ",";
//    else
//      inputParameters += inputArray[i] + ",";

  }
  console.log(inputParameters);
  return inputParameters.substring(0, inputParameters.length-1);

}

// MODULE HERE. refactor here

var playerQueue = [];
var gameSessions = [];

// END MODULE

http.listen(port, function(){
  console.log('listening on *:', port);
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
    delete questionObject.test_cases;

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
    try {

        var fn = new Function(createFunctionSignature(gameSession.question.test_cases[0].input), 'return ' + packet.code);

        for(var i=0; i < gameSession.question.test_cases.length; i++) {

            var test_case = gameSession.question.test_cases[i];

            console.log("function("+createFunctionSignature(gameSession.question.test_cases[0].input)+") = fn(" + createInputParameters(test_case.input) + ")");
            var actualValue = eval("fn(" + createInputParameters(test_case.input) + ")");
            if(actualValue != test_case.output) {
                console.log(test_case);
                gameSession.player1.emit("incorrect_answer", {"submitter": socket.id, "actual_value": actualValue});
                gameSession.player2.emit("incorrect_answer", {"submitter": socket.id, "actual_value": actualValue});
                return;
            }
        };
      }
    catch(exception) {
        gameSession.player1.emit("incorrect_answer", {"submitter": socket.id, "actual_value": exception.message});
        gameSession.player2.emit("incorrect_answer", {"submitter": socket.id, "actual_value": exception.message});
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
