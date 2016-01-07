var App = require('./App');
var React = require('react');
var ReactDOM = require('react-dom');

require('./sass/app.scss');
require('../src/sass/react-components.scss');

ReactDOM.render(
    <App />, document.getElementById('app')
);

