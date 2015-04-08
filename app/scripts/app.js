var React = window.React = require('react'),
    mountNode = document.getElementById("app");

var OneLinerApp = React.createClass({
  render: function() {
    return (
      <div>
        <h3>OneLiner</h3>
        <h4>scripts/apps.js rendered me, go take a gander!</h4>
      </div>
    );
  }
});

React.render(<OneLinerApp />, mountNode);

