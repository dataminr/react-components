define(function(require) {
    'use strict';

    var React = require('react');
    var originalCreateElement = React.createElement;
    var _ = require('lodash');

    return {
        /**
         * Replaces a specific React component with an empty React div during the React render cycle.
         * It's useful to be able to test a component without having it's child components execute and render.
         *
         * @param {String|Object} componentName - Name of the component to replace or object of components to replace.
         *                                        If object, each key should be the name of the component to replace
         *                                        and the values are the optional options to augment.
         * @param {Object=} additionalOptions - Object of div tag attributes to pass to mocked replacement div (className, id, etc).
         * @return {Object} - The newly created Jasmine spy.
         */
        mockReactComponent: function(componentName, additionalOptions){
            if(typeof componentName === 'string'){
                var tempComponentName = {};
                tempComponentName[componentName] = additionalOptions || {};
                componentName = tempComponentName;
            }

            var componentList = _.keys(componentName);

            return spyOn(React, 'createElement').and.callFake(function(){
                var args = Array.prototype.slice.call(arguments),
                    type = args[0];
                //If createElement is called with the component requested, replace it with
                //an empty div and overwrite it's options with what was provided or an empty object
                if(type && type.displayName && componentList.indexOf(type.displayName) > -1){
                    args[0] = 'div';
                    //Merge options if present. Allow calls to add/overwrite values
                    args[1] = args[1] ?
                        _.assign(args[1], componentName[type.displayName]) :
                        componentName[type.displayName];
                }
                return originalCreateElement.apply(React, args);
            });
        }
    };
});
