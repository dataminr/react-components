define(function(require) {
    'use strict';

    var Dispatcher = require('flux').Dispatcher;
    Dispatcher = new Dispatcher();

    /**
     * Simple utility method to avoid having to pass in a sub object for
     * each action to send.
     * @param  {Mixed} action Action contents to send
     */
    Dispatcher.dispatchAction = function(action){
        this.dispatch({action: action});
    };
    return Dispatcher;
});
