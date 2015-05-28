define(function(require) {
    'use strict';

    var App = require('examples/App');
    var React = require('react');

    React.render(
        React.createElement(App, null), document.getElementById('app')
    );
});
