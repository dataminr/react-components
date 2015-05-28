define(function(require) {
    'use strict';

    var AppDispatcher = require('drc/dispatcher/AppDispatcher');
    var _ = require('lodash');
    var moment = require('moment');
    var StoreBase = require('drc/lib/StoreBase');
    var TableActions = require('drc/table/TableActions');

    var ActionTypes = TableActions.actionTypes;

    /**
     * A Table requires a definition to operate upon. The table definition requires a url for requesting
     * data and an array of cols (column definitions). An object in the cols array requires a headerLabel,
     * dataProperty, and a percentage width. The Table may also receive a sortColIndex which adds required
     * fields to the cols objects of sortDirection (ascending/descending) and dataType (string, number,
     * percent, time, or status). The table definition may also include a pagination object with two required
     * properties (cursor - the starting index and size - number of lines per page).
     * @param {String} id - The unique identifier of the Table instance.
     * @param {Object} definition - A defined table.
     * @param {Function} dataFormatter - A function that will allow for post processing of data from the server.
     * @constructor
     */
    var Table = function(id, definition, dataFormatter) {
        this.id = id;
        this.url = definition.url;
        this.cols = definition.cols;
        this.sortColIndex = definition.sortColIndex;
        this.pagination = definition.pagination;
        this.cursor = definition.cursor;
        this.rowClick = definition.rowClick;
        this.advancedFilters = definition.advancedFilters;
        this.data = null;
        this.filteredData = null;
        this.displayedData = null;
        this.dataCount = null;
        this.dataFormatter = dataFormatter;
        this.selectedItems = {};
        this.selectDataProperty = _.result(_.find(this.cols, {'dataType': 'select'}), 'dataProperty');
    };

    Table.prototype = {
        /**
         * Triggered when data is received correctly from the server.
         * @param {Object} data - The data retrieved from the server for the Table instance.
         */
        onDataReceived: function(data) {
            this.data = _.values(data);

            // Run data through definition formatter if it exists.
            if (this.dataFormatter) {
                this.data = this.dataFormatter(data);
            }

            this.dataCount = this.data.length;

            // Run data through built in data formatters.
            _.forEach(this.cols, function(col) {
                // Default to 15 minutes if the onlineLimit for the col was not set or was set incorrectly.
                if (col.dataType === 'status' && (typeof col.onlineLimit !== 'number' || col.onlineLimit < 1)) {
                    col.onlineLimit = 15;
                }
                _.forEach(this.data, function(item) {
                    if (col.dataType === 'percent') {
                        item[col.dataProperty] += '%';
                    }
                    else if (col.dataType === 'time' || col.dataType === 'status') {
                        if (col.dataType === 'status' && item[col.dataProperty]) {
                            item.online = moment(item[col.dataProperty]).valueOf() > moment(Date.now()).subtract(col.onlineLimit, 'minutes').valueOf();
                        }

                        // Need to keep track of the original timestamp for column sorting to work properly.
                        item.timestamp = item[col.dataProperty] ? item[col.dataProperty] : null;
                        item[col.dataProperty] = item[col.dataProperty] ? moment(item[col.dataProperty]).format(col.timeFormat) : '--';
                    }
                });
            }, this);

            if (typeof this.sortColIndex === 'number') {
                this.sortData(this.sortColIndex, this.cols[this.sortColIndex].sortDirection);
            }
        },

        /**
         * Triggered when data doesn't return correctly from the server.
         */
        errorFunction: function() {
            this.data = null;
        },

        /**
         * Retrieves the data for the table (also triggers pagination).
         * @returns {Array} - A potentially filtered and paginated subset of table data.
         */
        getData: function() {
            var data = _.cloneDeep(this.data);
            this.dataCount = data.length;

            data = this.filterData(data);

            this.filteredData = data;

            if (this.pagination) {
                data = this.sliceData(data);
            }

            this.displayedData = data;

            return this.displayedData;
        },

        /**
         * Retrieves the number of data rows that need to be inserted into the table.
         * @returns {Number} - The number of table data elements.
         */
        getDataCount: function() {
            return this.dataCount;
        },

        /**
         * Retrieves the column definitions for the table.
         * @returns {Array} An array of objects that define table columns originally defined in the table definition.
         */
        getColDefinitions: function() {
            return this.cols;
        },

        /**
         * Retrieves the column index that the table is set to be sorting off of.
         * @returns {Number} - Table.sortColIndex originally defined in the table's definition.
         */
        getSortColIndex: function() {
            return this.sortColIndex;
        },

        /**
         * Retrieves a rowClick object for the Table.
         * @returns {Object} - Contains properties used in the row click handler of the table component.
         */
        getRowClickData: function() {
            return this.rowClick;
        },

        /**
         * Retrieves the pagination data for the table. This includes cursor and size.
         * @returns {{cursor: number, size: number}} - The pagination object.
         */
        getPaginationData: function() {
            return this.pagination;
        },

        /**
         * Sets the value used for filtering the Table.
         * @param {String|Number} value - The string or number used to filter out table rows that are not a match.
         */
        setFilterValue: function(value) {
            this.filterValue = value;

            if (this.pagination && this.pagination.cursor !== 0) {
                this.resetPagination();
            }
        },

        /**
         * Sets the value used for advanced filtering of the Table.
         * @param {Object} advancedFilters - The current state of the advanced filters from the Table instance.
         */
        setAdvancedFilters: function(advancedFilters) {
            this.advancedFilters = advancedFilters;

            if (this.pagination && this.pagination.cursor !== 0) {
                this.resetPagination();
            }
        },

        /**
         * Triggers quick filtering and advanced filtering of the data if either of those properties have been set.
         * @param {Array} data - Cloned Table.data.
         * @returns {Array} - The subset of fully filtered data.
         */
        filterData: function(data) {
            if (this.filterValue) {
                data = this.quickFilterData(data);
            }

            if (this.advancedFilters) {
                data = this.advancedFilterData(data);
            }

            this.dataCount = data.length;

            return data;
        },

        /**
         * Filters out table data that does not match the filter value for table cols that have quickFilter set to true.
         * @param {Array} data - Cloned Table.data.
         * @returns {Array} - The subset of data that matches the filter value.
         */
        quickFilterData: function(data) {
            var value = this.filterValue;
            var filteredData = [];
            var matches;

            _.forEach(this.cols, function(col) {
                if (col.quickFilter) {
                    matches = _.remove(data, function(item) {
                        if (typeof item[col.dataProperty] === 'string') {
                            return item[col.dataProperty].toLowerCase().indexOf(value.toString().toLowerCase()) !== -1;
                        }
                        else if (typeof item[col.dataProperty] === 'number') {
                            return item[col.dataProperty].toString().indexOf(value.toString()) !== -1;
                        }
                    });

                    filteredData = filteredData.concat(matches);
                }
            });

            return filteredData;
        },

        /**
         * Filters out table data where any property value equals a matching property value on an advanced filter
         * unless the advanced filter has been checked.
         * @param {Array} data - Cloned Table.data.
         * @returns {Array} - The subset of filtered data.
         */
        advancedFilterData: function(data) {
            var filteredData = [];

            _.each(data, function(item) {
                var shown = true;

                _.each(this.advancedFilters, function(filter) {
                    if (item[filter.dataProperty] === filter.filterValue) {
                        if (filter.checked) {
                            if (!item.shownByAdvancedFilters) {
                                item.shownByAdvancedFilters = [];
                            }
                            item.shownByAdvancedFilters.push(filter.dataProperty);
                            shown = true;
                        }
                        else if (!item.shownByAdvancedFilters) {
                            shown = false;
                        }
                    }
                }, this);

                if (shown) {
                    filteredData.push(item);
                }
            }, this);

            return filteredData;
        },

        /**
         * Moves the cursor forwards or backwards through paginated data.
         * @param {String} direction - the direction paginate (right or left).
         */
        paginate: function(direction) {
            var size = this.pagination.size;
            this.pagination.cursor += direction === 'right' ? size : -1 * size;
        },

        /**
         * When sorting is triggered, a paginated table with reposition it's cursor to the beginning.
         */
        resetPagination: function() {
            this.pagination.cursor = 0;
        },

        /**
         * Returns a subset of data for pagination.
         * @param {Object} data - The data retrieved from the server for the Table instance after formatting has occurred.
         * @returns {Array} - A paginated subset of table data.
         */
        sliceData: function(data) {
            return data.slice(this.pagination.cursor, this.pagination.cursor + this.pagination.size);
        },

        /**
         * Sorts the array of data for the Table based on the sort column index and the direction.
         * @param {Number} colIndex - The index of the table column that is to sorted.
         * @param {String} direction - The direction to sort (ascending or descending).
         */
        sortData: function(colIndex, direction) {
            this.sortColIndex = colIndex;
            this.cols[colIndex].sortDirection = direction;

            var dataType = this.cols[this.sortColIndex].dataType;
            var key;

            if (dataType === 'time' || dataType === 'status') {
                key = 'timestamp';
            }
            else {
                key = this.cols[this.sortColIndex].dataProperty;
            }

            if (this.pagination) {
                this.resetPagination();
            }

            this.data.sort(function(a, b) {
                var first = a[key];
                var second = b[key];

                if (dataType === 'string') {
                    first = first.toLowerCase();
                    second = second.toLowerCase();
                }
                if (dataType === 'time' || dataType === 'status') {
                    first = first ? first : 0;
                    second = second ? second : 0;
                }
                if (first > second) {
                    return direction === 'ascending' ? 1 : -1;
                }
                if (first < second) {
                    return direction === 'ascending' ? -1 : 1;
                }
                // a must be equal to b
                return 0;
            });
        },

        /**
         * Retrieves the selected items for the Table.
         * @returns {{}|Table.selectedItems} - The object containing all of the selected keys.
         */
        getSelectedItems: function() {
            return this.selectedItems;
        },

        /**
         * Retrieves the filtered data for the Table.
         * @returns {[]|Table.filteredData} - The subset of Table data post filtering.
         */
        getFilteredData: function() {
            return this.filteredData;
        },

        /**
         * Bulk add or remove keys to/from the Table's selected items.
         * @param {Boolean} deselect - There are selected items in the filtered data set, so we need to deselect them.
         */
        updateBulkSelection: function(deselect) {
            _.forEach(this.filteredData, function(data) {
                if (deselect) {
                    delete this.selectedItems[data[this.selectDataProperty]];
                }
                else {
                    this.selectedItems[data[this.selectDataProperty]] = data;
                }
            }, this);
        },

        /**
         * Add or remove a key to/from the Table's selected items.
         * @param {Number} rowIndex - The row index within the displayed data to pull the key from.
         */
        updateRowSelection: function(rowIndex) {
            var key = this.displayedData[rowIndex][this.selectDataProperty];
            if (this.selectedItems[key]) {
                delete this.selectedItems[key];
            }
            else {
                this.selectedItems[key] = this.displayedData[rowIndex];
            }
        }
    };

    var TableStore = _.merge({
        // Holds all of the existing Tables.
        collection: {},
        // The components that are allowed to dispatch actions into this store.
        componentType: 'Table',

        /**
         * Creates an instance of Table.
         * @param {String} id - The unique identifier used to access the Table instance.
         * @param {String} definition - A defined Table.
         * @param {Function} dataFormatter - A function that will allow for post processing of data from the server.
         */
        createInstance: function(id, definition, dataFormatter) {
            this.collection[id] = new Table(id, definition, dataFormatter);
        },

        /**
         * Destroys an instance of Table.
         * @param {String} id - The unique identifier of the Table instance to be destroyed.
         */
        destroyInstance: function(id) {
            delete this.collection[id];
        },

        /**
         * Retrieves a Table instance.
         * @param {String} id - The unique identifier fo the Table instance to retrieve.
         * @returns {Table} - An instance of the Table class.
         */
        getInstance: function(id) {
            return this.collection[id];
        },

        /**
         * Retrieves a list of selected Table row items.
         * @param {String} id - The unique identifier fo the Table instance to retrieve.
         * @returns {Array} - The list of keys from the selected items.
         */
        getSelectedItems: function(id) {
            return _.keys(this.collection[id].getSelectedItems());
        },

        /**
         * Handles all events sent from the dispatcher. Filters out to only those sent via the Table
         * @param {Object} payload - Contains action details.
         */
        dispatchRegister: function(payload) {
            var action = payload.action;

            if (!this.shouldHandleAction(action.component)) {
                return;
            }

            switch (action.actionType) {
                case ActionTypes.REQUEST_DATA:
                    this.handleRequestDataAction(action);
                    break;
                case ActionTypes.TABLE_SORT:
                    this.collection[action.id].sortData(action.data.colIndex, action.data.direction);
                    this.emitChange(action.id);
                    break;
                case ActionTypes.FILTER:
                    this.collection[action.id].setFilterValue(action.data.value);
                    this.emitChange(action.id);
                    break;
                case ActionTypes.ADVANCED_FILTER:
                    this.collection[action.id].setAdvancedFilters(action.data.advancedFilters);
                    this.emitChange(action.id);
                    break;
                case ActionTypes.PAGINATE:
                    this.collection[action.id].paginate(action.data.direction);
                    this.emitChange(action.id);
                    break;
                case ActionTypes.TOGGLE_BULK_SELECT:
                    this.collection[action.id].updateBulkSelection(action.data.deselect);
                    this.emitChange(action.id);
                    break;
                case ActionTypes.TOGGLE_ROW_SELECT:
                    this.collection[action.id].updateRowSelection(action.data.rowIndex);
                    this.emitChange(action.id);
                    break;
                case ActionTypes.DESTROY_INSTANCE:
                    this.destroyInstance(action.id);
                    break;
            }
        },

        Table: Table
    }, StoreBase);

    AppDispatcher.register(_.bind(TableStore.dispatchRegister, TableStore));

    return TableStore;
});
