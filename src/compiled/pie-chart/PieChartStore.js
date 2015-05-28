define(function(require) {
    'use strict';

    var AppDispatcher = require('drc/dispatcher/AppDispatcher');
    var _ = require('lodash');
    var PieChartActions = require('drc/pie-chart/PieChartActions');
    var StoreBase = require('drc/lib/StoreBase');

    var ActionTypes = PieChartActions.actionTypes;

    /**
     * A PieChart requires a definition to operate upon. The pie chart definition requires a url for requesting
     * data and a label to display above the chart.
     * @param {string} id - The unique identifier used to access the PieChart instance.
     * @param {object} definition - A configuration object for the PieChart.
     * @constructor
     */
    var PieChart = function(id, definition) {
        this.id = id;
        this.definition = definition;
        this.url = definition.url;
        this.label = definition.label;
    };

    PieChart.prototype = {
        /**
         * Triggered when data is received correctly from the server.
         * @param {object} data - The data received from the server used to populate the PieChart component.
         */
        onDataReceived: function(data) {
            this.data = data;
        },

        /**
         * Triggered when data doesn't return correctly from the server.
         */
        errorFunction: function() {
            this.data = null;
        },

        /**
         * Returns the PieChart's data.
         * @returns {object} - PieChart.data
         */
        getData: function() {
            return this.data;
        },

        /**
         * Returns the PieChart's label.
         * @returns {string} - PieChart.label.
         */
        getLabel: function() {
            return this.label;
        }
    };

    var PieChartStore = _.merge({
        // Holds all of the existing PieCharts.
        collection: {},
        // The components that are allowed to dispatch actions into this store.
        componentType: 'PieChart',

        /**
         * Creates an instance of PieChart
         * @param {string} id - The unique identifier used to access the PieChart instance.
         * @param {string} definition - A configuration object for the PieChart.
         */
        createInstance: function(id, definition) {
            this.collection[id] = new PieChart(id, definition);
        },

        /**
         * Destroys an instance of Table.
         * @param {string} id - The unique identifier of the PieChart to destroy.
         */
        destroyInstance: function(id) {
            delete this.collection[id];
        },

        /**
         * Returns store data for requested PieChart.
         * @param  {string} id - The unique identifier of the PieChart to retrieve data from.
         * @return {object|null} - Store data or null if not yet retrieved.
         */
        getData: function(id) {
            return this.collection[id].getData();
        },

        /**
         * Retrieves the label for a PieChart.
         * @param {string} id - The unique identifier of the PieChart instance to retrieve the label from.
         * @returns {string} - PieChart.label.
         */
        getLabel: function(id) {
            if (this.collection[id]) {
                return this.collection[id].getLabel();
            }
        },

        /**
         * Handles all events sent from the dispatcher. Filters out to only those sent via the PieChart.
         * @param {object} payload - Contains action details.
         */
        dispatchRegister: function(payload) {
            var action = payload.action;

            if (!this.shouldHandleAction(action.component)) {
                return;
            }

            switch(action.actionType) {
                case ActionTypes.REQUEST_DATA:
                    this.handleRequestDataAction(action);
                    break;
                case ActionTypes.DESTROY_INSTANCE:
                    this.destroyInstance(action.id);
                    break;
            }
        },

        PieChart: PieChart
    }, StoreBase);

    AppDispatcher.register(_.bind(PieChartStore.dispatchRegister, PieChartStore));

    return PieChartStore;
});
