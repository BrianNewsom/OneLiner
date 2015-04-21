var React = window.React = require('react'),
    mountNode = document.getElementById("app");


var Question = React.createClass({
    render: function() {
    console.log(this.props)
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
                              <input className="form-control" id="user-output" placeholder="Your Output" readOnly></input>
                          </div>
                          <div className="col-md-3 col-mod-offset-6" id="opponent">
                              <input className="form-control" id="opponent-output" placeholder="Opponent Output" readOnly></input>
                          </div>
                      </div>
                      <div className="row">
                          <CountdownTimer secondsRemaining={this.props.question_data.time} />
                      </div>
                  </div>
                </div>
            </div>
        );
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
        return (
            <div id="code-box">
                <textarea className="form-control" id="code" rows="3" placeholder="Write some code to solve the question"></textarea>
                <button className="btn btn-default" id="submit" onClick={this.handleClick}>Submit</button>
            </div>
        )

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
    if (this.state.secondsRemaining <= 0) {
      clearInterval(this.interval);
    }
  },
  componentDidMount: function() {
    this.setState({ secondsRemaining: this.props.secondsRemaining });
    this.interval = setInterval(this.tick, 1000);
  },
  componentWillUnmount: function() {
    clearInterval(this.interval);
  },
  render: function() {
    return (
      <div>Seconds Remaining: {this.state.secondsRemaining}</div>
    );
  }
});

var parseQuestionInput = function(myString) {
  var toReturn = ""
  for (var i in myString){
    toReturn += "var" + i + ": " + JSON.stringify(myString[i]) + ",  "
  }
  return toReturn
};

var OneLinerApp = React.createClass({
  getInitialState: function() {
    return ({question_data: {
        question: 'Example Question',
        difficulty: 0,
        time: 0,
        test_data:
            {
                input: [[1,4],[2]],
                output: 2
            }
    }
    })
  },
  onSubmit: function() {
    var code = $('#code').val();
    console.log(code);
    var fn = new Function('input', "return " + code);
    var output = fn(10);
    $('#user-output').val(output);
  },
  render: function() {
    var q = {question: 'Return the input array without any sevens', testCases: [{input: [1,2,7,4,5,6], output: [1,2,4,5,6]}]}
    return (
      <div className="container-fluid">
        <Question question_data={this.state.question_data} />
        <CodeBox clicked={this.onSubmit}/>
      </div>
    );
  }
});

React.render(<OneLinerApp />, mountNode);

