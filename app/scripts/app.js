var React = window.React = require('react'),
    mountNode = document.getElementById("app");


var Question = React.createClass({
    render: function() {
      if(!this.props.hidden) {
        return (
            <div id="question">
                  <div id="output">
                      <div className="row">
                          <div className="col-md-6 col-md-offset-5">
                              <h2>{this.props.question_data.question}</h2>
                              <input className="form-control" id="question-input" placeholder={"Input: " + parseQuestionInput(this.props.question_data.test_data.input)} readOnly></input>
                          </div>
                      </div>
                      <div className="row">
                          <div className="col-md-3 col-md-offset-5">
                              <input className="form-control" id="expected-output" placeholder={"Expected Output: " + this.props.question_data.test_data.output} readOnly></input>
                          </div>
                          <div className="col-md-3 col-mod-offset-6" id="opponent">
                              <input className="form-control" id="opponent-output" placeholder={"Opponent Output: " + this.props.opponentOutput} readOnly></input>
                          </div>
                      </div>
                      <div className="row">
                          <div className="col-md-6 col-md-offset-5">
                            <input id="output-box" className="form-control" placeholder={"Your Output: " + this.props.output} readOnly></input>
                          </div>
                      </div>
                </div>
            </div>
        );
    }
  else{
  return <div></div>
}
    }
});

var Boilerplate = React.createClass({
    render: function() {
        return (
            <div id="boilerplate">
                <p> {this.props.boilerplate} </p>
            </div>
        );
    }

});

var CodeBox = React.createClass({
    handleClick: function() {
        this.props.clicked();
    },
    render: function() {

      if(!this.props.hidden){
        return (
            <div className="row">
                <div className="col-md-6 col-md-offset-5">
                    <div id="code-box">
                        <textarea className="form-control" id="code" rows="3" placeholder="Write some code to solve the question">return </textarea>
                        <button className="btn btn-default" id="submit" onClick={this.handleClick}>Submit</button>
                    </div>
                </div>
            </div>
        )
      }
      else{
        return <div/>;
      }

    }

})

var parseQuestionInput = function(myString) {
  var toReturn = ""
  if (!myString){
    return toReturn
  }
  for (var i = 0; i < myString.length; i++){
    console.log(typeof(i))
    toReturn += "var" + parseInt(i+1) + ": " + JSON.stringify(myString[i]) + ",  "
  }
  return toReturn.substring(0, toReturn.length - 3);
};

var WelcomePage = React.createClass({

  render: function() {

    if(this.props.hidden)
      return <div/>

    else
      return (
        <div>
          <div className = "row">
            <img className="logoFit" src="http://i.imgur.com/aDL2oT4.png"></img>
          </div>
          <div className = "row">
            <div className ="welcomeBody col-md-offset-2 col-md-8">You have arrived at OneLiner! This is a live coding competition where you need to out-program another person live via one line return statements. JavaScript is your weapon, solve wisely my friends.</div>
          </div>
          <div className = "row">
            <div className ="welcomeBody col-md-offset-2 col-md-8">Awaiting match</div>
          </div>
          <div className = "row">
            <img className = "spinWait" src="https://apps.nea.gov/grantsearch/images/ajaxSpinner.gif" alt="Waiting spinner"></img>
          </div>
        </div>
      )

  }

});

var GameOverPage = React.createClass({
  handleClick: function() {
    this.props.clicked();
  },
  render: function() {

    if(this.props.hidden)
      return <div/>

    else{
      var result = "";
      this.props.winner ? result = "You Win!" : result = "You Lose :(";

      return (
        <div>
          <div className = "row">
            <img className="logoFit" src="http://i.imgur.com/aDL2oT4.png"></img>
          </div>
          <div className = "row">
            <h1> Game Over! </h1>
          </div>
          <div className = "row">
            <h1> {result} </h1>
          </div>
          <br/>
          <button onClick={this.handleClick} className="btn btn-default">Play Again!</button>
          <br/>
        </div>
      )
    }

  }

});


var OneLinerApp = React.createClass({
  getInitialState: function() {
    return ({
        currentSession: { question: {
            question: '',
            difficulty: 0,
            time: 0,
            test_data:
                {
                    input: null,
                    output: ""
                }
        }},
        socket: io(),
        yourOutput: "",
        opponentOutput: "",
        isMatched:false,
        isGameOver:false
    })
  },
  componentDidMount: function()
  {

      var socket = this.state.socket;

      socket.on("match_made", function(session) {

        $("#output-box").removeClass("error");

        console.log("found a match: " + JSON.stringify(session));

        currentSession = session;

        this.setState({currentSession: session, isMatched: true, yourOutput: "", opponentOutput: ""});

        // Put cursor in text element

        // TODO: Move TFO of here
        $.fn.selectRange = function(start, end) {
            if(!end) end = start;
            return this.each(function() {
                if (this.setSelectionRange) {
                    this.focus();
                    this.setSelectionRange(start, end);
                } else if (this.createTextRange) {
                    var range = this.createTextRange();
                    range.collapse(true);
                    range.moveEnd('character', end);
                    range.moveStart('character', start);
                    range.select();
                }
            });
        };

        $('#code').selectRange(7);
      }.bind(this));

     socket.on("incorrect_answer", function(debug_info) {

       console.log(debug_info);
       if(this.state.currentSession.opponent_id != debug_info.submitter) {

          this.setState({yourOutput: debug_info.actual_value});

          $("#expected-output").val("Expected Output: " + debug_info.expected_value);
          $("#question-input").val("Input: " + parseQuestionInput(debug_info.input_value));
          $("#output-box").addClass("error");

       }
       else {

         this.setState({opponentOutput: debug_info.actual_value});

       }

     }.bind(this));

    socket.on("game_over", function(result) {

      this.setState({isWinner: this.state.currentSession.opponent_id != result.winner});
      this.setState({isGameOver: "true"});
      /*
      socket.emit("requeue");

      $('#code').val("return ");
      */

    }.bind(this));

  },
  onSubmit: function() {

    var code = $('#code').val();

    var socket = this.state.socket;

    socket.emit("submit_answer", {session_id: this.state.currentSession.session_id, code: code});

  },
  onPlayAgain: function() {

    var socket = this.state.socket;

    this.setState({
        currentSession: { question: {
            question: '',
            difficulty: 0,
            time: 0,
            test_data:
                {
                    input: null,
                    output: ""
                }
        }},
        isMatched: false, isGameOver: false, yourOutput: "", opponentOutput: "", isWinner: false
    });

    socket.emit("requeue");
  },
  render: function() {
    return (
      <div className="container-fluid">
        <WelcomePage hidden={this.state.isMatched}/>
            <div className="col-md-9">
                <Question question_data={this.state.currentSession.question} output={this.state.yourOutput} opponentOutput={this.state.opponentOutput} hidden={!this.state.isMatched || this.state.isGameOver}/>
                <CodeBox clicked={this.onSubmit} hidden={!this.state.isMatched || this.state.isGameOver}/>
            </div>
        <GameOverPage hidden={!this.state.isGameOver} clicked={this.onPlayAgain} winner={this.state.isWinner}/>
      </div>
    );
  }
});

React.render(<OneLinerApp />, mountNode);

