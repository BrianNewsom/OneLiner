var React = window.React = require('react'),
    mountNode = document.getElementById("app");


var Question = React.createClass({
    render: function() {
      if(!this.props.hidden){
        return (
            <div id="question">
                <h2>{this.props.question_data.question}</h2>
                <div className="col-md-9">
                  <div id="output">
                      <div className="row">
                          <div className="col-md-6 col-md-offset-5">
                              <input className="form-control" id="solution-output" placeholder={"Input: " + parseQuestionInput(this.props.question_data.test_data.input)} readOnly></input>
                          </div>
                      </div>
                      <div className="row">
                          <div className="col-md-3 col-md-offset-5">
                              <input className="form-control" id="user-output" placeholder={"Expected Output: " + this.props.question_data.test_data.output} readOnly></input>
                          </div>
                          <div className="col-md-3 col-mod-offset-6" id="opponent">
                              <input className="form-control" id="opponent-output" placeholder={"Opponent Output: " + this.props.opponentOutput} readOnly></input>
                          </div>
                      </div>
                      <div className="row">
                          <div className="col-md-6 col-md-offset-5">
                            <input className="form-control" placeholder={"Your Output: " + this.props.output} readOnly></input>
                          </div>
                      </div>
                      <div className="row">
                        <CountdownTimer secondsRemaining={this.props.question_data.time}/>
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
                <div id="code-box">
                    <textarea className="form-control" id="code" rows="3" placeholder="Write some code to solve the question">return ;</textarea>
                    <button className="btn btn-default" id="submit" onClick={this.handleClick}>Submit</button>
                </div>
            </div>
        )
      }
      else{
        return <div/>;
      }

    }

})

var CountdownTimer = React.createClass({
  getInitialState: function() {
    return {
      secondsRemaining: 0
    };
  },
  tick: function() {

    this.setState({secondsRemaining: this.state.secondsRemaining - 1});
    if (this.state.secondsRemaining < 0) {
      clearInterval(this.interval);
    }

  },
  componentWillReceiveProps: function(nextProp) {

    this.setState({ secondsRemaining: nextProp.secondsRemaining });
    clearInterval(this.interval);
    this.interval = setInterval(this.tick, 1000);

  },
  componentDidMount: function() {

    this.setState({ secondsRemaining: this.props.secondsRemaining });
    this.interval = setInterval(this.tick, 1000);

  },
  componentWillUnmount: function() {

    clearInterval(this.interval);

  },
  render: function() {
    console.log("render: " + this.props.secondsRemaining);
    return (
    <div>
       <ul>
          <li className="chart" data-percent="100"><span>{this.state.secondsRemaining}</span></li>
      </ul>
    </div>
    );
  }
});

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
      return <p>WELCOME !</p>;
    
  }
  
});

var OneLinerApp = React.createClass({
  getInitialState: function() {
    return ({ currentSession: {question: {
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
    isMatched:false
    })
  },
  componentDidMount: function()
  {

      var socket = this.state.socket;

      socket.on("match_made", function(session) {

        console.log("found a match: " + JSON.stringify(session));

        currentSession = session;

        this.setState({currentSession: session, isMatched: true});

      }.bind(this));

     socket.on("incorrect_answer", function(debug_info) {

       console.log(debug_info);
       if(this.state.currentSession.opponent_id != debug_info.submitter) {

          this.setState({yourOutput: debug_info.actual_value});

       }
       else {

         this.setState({opponentOutput: debug_info.actual_value});

       }

     }.bind(this));

    socket.on("game_over", function(result){

      alert("You " + (this.state.currentSession.opponent_id!=result.winner?"Win!":"Lose :(") + "\nCorrect Answer: " + result.code);

    }.bind(this));

  },
  onSubmit: function() {

    var code = $('#code').val();

    var socket = this.state.socket;

    socket.emit("submit_answer", {session_id: this.state.currentSession.session_id, code: code});

  },
  render: function() {
    return (
      <div className="container-fluid">
        <WelcomePage hidden={this.state.isMatched}/>
        <Question question_data={this.state.currentSession.question} output={this.state.yourOutput} opponentOutput={this.state.opponentOutput} hidden={!this.state.isMatched}/>
        <CodeBox clicked={this.onSubmit} hidden={!this.state.isMatched}/>
      </div>
    );
  }
});

React.render(<OneLinerApp />, mountNode);

