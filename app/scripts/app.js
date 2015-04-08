var React = window.React = require('react'),
    mountNode = document.getElementById("app");

var Output = React.createClass({
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
    render: function() {
        return (
            <div id="user-code">
                <h3>Write some code to solve the problem</h3>
                <textarea className="form-control" id="code" rows="3"></textarea>
            </div>
        )

    }

})

var OneLinerApp = React.createClass({
  render: function() {
    var boilerplate = "function(input){\n\treturn USER-CODE\n}";
    return (
      <div>
        <h3>OneLiner</h3>
        <h4>scripts/apps.js rendered me, go take a gander!</h4>
        <div className="row">
            <div className="col-md-3">
                <Boilerplate boilerplate={boilerplate} />
            </div>
            <div className="col-md-9">
                <Output />
            </div>
        </div>
        <UserCode />
      </div>
    );
  }
});

React.render(<OneLinerApp />, mountNode);

