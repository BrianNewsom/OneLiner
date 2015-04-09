var React = window.React = require('react'),
    mountNode = document.getElementById("app");


var Question = React.createClass({
    getQuestion : function(){
        // TODO: Use ajax call
        return this.props.question;
    },

    render: function() {
        return (
            <div id="question">
                <h2>{this.getQuestion()}</h2>
            </div>
        );
    }
});

var Output = React.createClass({
    getSolution: function() {
        this.props.expectedSolution;
    },

    render: function() {
        return (
            <div id="output">
                <div className="row" id="solution">
                    <div className="col-md-4"></div>
                    <div className="col-md-4">
                        <h5 id="expected-output-title">Expected Output</h5>
                        <input className="form-control" id="solution-output"></input>
                    </div>
                </div>
                <div className="row" id="users">
                    <div className="col-md-2"></div>
                    <div className="col-md-3" id="user">
                        <h5> Your Output </h5>
                        <input className="form-control" id="user-output"></input>
                    </div>
                    <div className="col-md-2"></div>
                    <div className="col-md-3" id="opponent">
                        <h5> Opponents Output </h5>
                        <input className="form-control" id="opponent-output"></input>
                    </div>
                    <div className="col-md-2"></div>
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
        )
    }

});

var UserCode = React.createClass({
    handleClick: function() {
        this.props.clicked();
    },
    render: function() {
        return (
            <div id="user-code">
                <h3>Write some code to solve the problem</h3>
                <textarea className="form-control" id="code" rows="3"></textarea>
                <button className="btn btn-default" id="submit" onClick={this.handleClick}>Submit</button>
            </div>
        )

    }

})

var OneLinerApp = React.createClass({
  onSubmit: function() {
    var code = $('#code').val();
    console.log(code);
    var fn = new Function('input', "return " + code);
    var output = fn(10);
    $('#user-output').val(output);
  },


  render: function() {
    var boilerplate = "function(input){\n\treturn USER-CODE\n}";
    var q = {question: 'Return the input array without any sevens', testCases: [{input: [1,2,7,4,5,6], output: [1,2,4,5,6]}]}
    return (
      <div>
        <h1>OneLiner</h1>
        <Question question={q.question} />
        <div className="row">
            <div className="col-md-3">
                <Boilerplate boilerplate={boilerplate} />
            </div>
            <div className="col-md-9">
                <Output expectedSolution={q.testCases[0].output} />
            </div>
        </div>
        <UserCode clicked={this.onSubmit}/>
      </div>
    );
  }
});

React.render(<OneLinerApp />, mountNode);

