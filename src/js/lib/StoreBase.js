define(function(require) {
    'use strict';

    var EventEmitter = require('third-party/eventEmitter');
    var _ = require('lodash');
    var RequestHandler = require('RequestHandler');

    /**
     * All stores will be merged with the StoreBase. All of the functionality here has been abstracted from the
     * standard Flux store to eliminate boilerplate logic in all of the stores. Not all of the StoreBase functionality
     * is intended to be leveraged by every store. For instance, a store managing toggle state of a component which
     * doesn't require a query to the server will not use the requestData function.
     */
    var StoreBase = _.merge(EventEmitter.prototype, {
        /**
         * Makes a request for data.
         * @param {string} id - Type of data being requested.
         * @param {object} filters - Filter object for request.
         * @param {function} callback - Method to execute upon completion.
         */
        requestData: function(id, filters, callback) {
            var requestModel = this.collection[id];

            RequestHandler.request(requestModel.url, filters, function(data, responseResult) {
                requestModel.onDataReceived(data);
                callback();
            }, function(){
                requestModel.errorFunction();
                callback(true);
            });
        },

        /**
         * Fire change events for data. Fires two events, a generic 'change' event, and a
         * specific change event for the component that is changing.
         * @param {string=} namespace - The name or identifier to associate with the change event.
         * @param {...mixed} var_args - Additional arguments.
         */
        emitChange: function(namespace) {
            var args = Array.prototype.slice.call(arguments, 1);
            args.unshift('change');
            this.emit.apply(this, args);
            if(namespace !== null && namespace !== undefined){
                args[0] = 'change:' + namespace;
                this.emit.apply(this, args);
            }
        },

        /**
         * Fire fail events. Fires two events, a generic 'fail' event, and a
         * specific fail event for the component that erred out. These event names would
         * be called 'error' but those are reserved in the EventEmitter we're using.
         * @param {string} namespace - The name or identifier to associate with the change event.
         * @param {...mixed} var_args - Additional arguments.
         */
        emitFail: function(namespace) {
            var args = Array.prototype.slice.call(arguments, 1);
            args.unshift('fail');
            this.emit.apply(this, args);
            if(namespace !== null && namespace !== undefined){
                args[0] = 'fail:' + namespace;
                this.emit.apply(this, args);
            }
        },

        /**
         * Determines if the component type for this action should be handled by this model.
         * @param  {string} actionComponent - The component name.
         * @return {boolean} - Whether model should handle action.
         */
        shouldHandleAction: function(actionComponent){
            if (_.isString(this.componentType)) {
                return actionComponent === this.componentType;
            }
            if (_.isArray(this.componentType)) {
                return _.contains(this.componentType, actionComponent);
            }
            return true;
        },

        /**
         * Handles all events sent from the dispatcher. Filters out to only those sent via components listed in the
         * componentType array.
         * @param {object} action - Action details.
         */
        handleRequestDataAction: function(action) {
            var id = action.id;

            // we only care about actions that are for the component tied to this model
            if (!this.shouldHandleAction(action.component)) {
                return;
            }

            if (!_.find(this.collection, id) && !this.collection[id]) {
                this.createInstance(id, action.data.definition, action.data.dataFormatter);
            }

            if (action.actionType === 'REQUEST_DATA') {
                this.requestData(id, action.data.filters, _.bind(function(error) {
                    if (error) {
                        this.emitFail(id);
                    }
                    else{
                        this.emitChange(id);
                    }
                }, this));
            }
        }
    });

    return StoreBase;
});
