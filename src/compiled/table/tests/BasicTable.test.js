define(function(require) {
    var BasicTable = require('drc/table/BasicTable');
    var _ = require('lodash');
    var Moment = require('moment');
    var React = require('react');
    var TableActions = require('drc/table/TableActions');
    var TableStore = require('drc/table/TableStore');
    var Utils = require('drc/utils/Utils');

    var TestUtils = React.addons.TestUtils;

    describe('Table', function() {
        var table, id;

        var iconClasses = {
            deselectAll: 'test-deselect-all',
            pageLeft: 'test-page-left',
            pageRight: 'test-page-right',
            selectAll: 'test-select-all',
            sortAsc: 'test-sort-asc',
            sortDesc: 'test-sort-desc',
            statusOn: 'test-status-on',
            statusOff: 'test-status-off'
        };

        var definition = {
            url: 'table/company',
            cols: [
                {
                    dataProperty: 'string',
                    dataType: 'string',
                    hoverProperty: 'string',
                    sortDirection: 'ascending'
                },
                {
                    dataProperty: 'integer',
                    dataType: 'number',
                    sortDirection: 'descending'
                },
                {
                    dataProperty: 'mixedCase',
                    dataType: 'string',
                    sortDirection: 'ascending'
                },
                {
                    dataProperty: 'time',
                    dataType: 'time',
                    sortDirection: 'ascending',
                    timeFormat: 'MMM Do, h A'
                },
                {
                    dataProperty: 'percent',
                    dataType: 'percent',
                    sortDirection: 'descending'
                },
                {
                    dataProperty: 'status',
                    dataType: 'status',
                    timeFormat: 'MMM Do, h A'
                }
            ],
            sortColIndex: 0,
            pagination: {
                cursor: 0,
                size: 2
            },
            rowClick: {
                callback: function() {}
            }
        };

        function dataFormatter(data) {
            return data;
        }

        var tableData = [
            {string: 'aaa', integer: -2, mixedCase: 'Aaa', time: 1417455952, percent: 87, status: Moment().subtract(5, 'minutes')},
            {string: 'b', integer: 3, mixedCase: 'B', percent: 42, status: Moment().subtract(14, 'minutes')},
            {string: 'a', integer: 0, mixedCase: 'a', time: 1416591981, percent: 37},
            {string: 'aa', integer: 2, mixedCase: 'Aa', time: 1417715098, percent: 96, status: Moment().subtract(3, 'days')},
            {string: 'aab', integer: -1, mixedCase: 'aAb', percent: 8, status: Moment().subtract(45, 'minutes')},
            {string: 'ab', integer: 1, mixedCase: 'aB', percent: 15, status: Moment().subtract(20, 'hours')},
            {string: 'aba', integer: 1, mixedCase: 'aBA', time: 1406479597, percent: 67, status: Moment().subtract(50, 'days')}
        ];

        function spyOnTableGetCalls(data, count, colDef, sortIdx, rowClick, pagination) {
            var tableInstance = TableStore.getInstance(id);

            spyOn(tableInstance, 'getData').and.returnValue(data);
            spyOn(tableInstance, 'getDataCount').and.returnValue(count);
            spyOn(tableInstance, 'getColDefinitions').and.returnValue(colDef);
            spyOn(tableInstance, 'getSortColIndex').and.returnValue(sortIdx);
            spyOn(tableInstance, 'getRowClickData').and.returnValue(rowClick);
            spyOn(tableInstance, 'getPaginationData').and.returnValue(pagination);
        }

        beforeEach(function() {
            id = 'table-' + Utils.guid();
            var props = {
                definition: definition,
                dataFormatter: dataFormatter,
                componentId: id,
                key: id,
                filters: {},
                loadingIconClasses: ['icon', 'ion-loading-c']
            };

            table = TestUtils.renderIntoDocument(React.createElement(BasicTable, React.__spread({},  props)));
            table.requestData();
        });

        describe('getInitialState function', function() {
            it('should initialize the state of the component', function() {
                expect(table.state.loading).toEqual(true);
                expect(table.state.data).toBeNull();
                expect(table.state.dataError).toEqual(false);
            });

            it('should set selectionEnabled to true if there is a column in the definition with a dataType of select', function() {
                var def = _.cloneDeep(definition);
                def.cols.unshift({dataType: 'select', dataProperty: 'string'});
                var props = {
                    definition: def,
                    componentId: id,
                    key: id,
                    filters: {},
                    loadingIconClasses: ['icon', 'ion-loading-c']
                };
                table = TestUtils.renderIntoDocument(React.createElement(BasicTable, React.__spread({},  props)));

                expect(table.selectionEnabled).toBeTruthy();
            });

            it('should initialize the quickFilterEnabled property to false if quickFilter is not set to true for all cols', function() {
                expect(table.quickFilterEnabled).toEqual(false);
            });

            it('should set the quickFilterEnabled property to true if it is quickFilter is set to true on a column definition', function() {
                var def = _.cloneDeep(definition);
                def.cols[0].quickFilter = true;
                var props = {
                    definition: def,
                    componentId: id,
                    key: id,
                    filters: {},
                    loadingIconClasses: ['icon', 'ion-loading-c']
                };

                table = TestUtils.renderIntoDocument(React.createElement(BasicTable, React.__spread({},  props)));
                expect(table.quickFilterEnabled).toEqual(true);
            });

            it('should initialize the advancedFilters property to null if advancedFilters were set on the table definition', function() {
                expect(table.state.advancedFilters).toBeNull();
            });

            it('should initialize the advancedFilters property to what was set on the table definition', function() {
                var def = _.cloneDeep(definition);
                def.advancedFilters = {
                    testFilter: 'testVal'
                };
                var props = {
                    definition: def,
                    componentId: id,
                    key: id,
                    filters: {},
                    loadingIconClasses: ['icon', 'ion-loading-c']
                };

                table = TestUtils.renderIntoDocument(React.createElement(BasicTable, React.__spread({},  props)));
                expect(table.state.advancedFilters).toEqual(def.advancedFilters);
            });
        });

        describe('componentDidMount function', function() {
            it('should register listeners', function() {
                spyOn(TableStore, 'on');
                table.componentDidMount();
                expect(TableStore.on.calls.count()).toEqual(2);
            });

            describe('once listeners are registered', function() {
                beforeEach(function(done) {
                    spyOn(table, 'requestData');
                    table.componentDidMount();
                    setTimeout(function() {
                        done();
                    }, 1);
                });

                it('should request data for the component', function(done) {
                    expect(table.requestData).toHaveBeenCalled();
                    done();
                });
            });
        });

        describe('componentWillUnmount function', function() {
            it('should remove listeners', function() {
                spyOn(TableStore, 'removeListener');
                table.componentWillUnmount();
                expect(TableStore.removeListener.calls.count()).toEqual(2);
            });
        });

        describe('requestData function', function() {
            it('should put the component into a loading state with no data errors and make a request for data', function() {
                spyOn(TableActions, 'requestData');
                table.setState({
                    loading: false,
                    dataError: true
                });

                expect(table.state.loading).toEqual(false);
                expect(table.state.dataError).toEqual(true);

                table.requestData();

                expect(TableActions.requestData).toHaveBeenCalledWith(id, definition, dataFormatter, {});
                expect(table.state.loading).toEqual(true);
                expect(table.state.dataError).toEqual(false);
            });
        });

        describe('onDataReceived function', function() {
            it('should request the table state and set state for the table to render', function() {
                spyOnTableGetCalls(tableData, tableData.length, definition.cols, definition.sortColIndex, undefined, definition.pagination);
                table.selectionEnabled = true;
                table.onDataReceived();

                expect(table.state.colDefinitions).toEqual(definition.cols);
                expect(table.state.colSortDirections).toEqual(table.getColSortDirections(definition.cols));
                expect(table.state.dataCount).toEqual(tableData.length);
                expect(table.state.data).toEqual(tableData);
                expect(table.state.filteredData).toBeNull();
                expect(table.state.loading).toBeFalsy();
                expect(table.state.pagination).toEqual(definition.pagination);
                expect(table.state.rowClick).toBeUndefined();
                expect(table.state.selectedItems).toBeTruthy();
                expect(table.state.sortColIndex).toEqual(definition.sortColIndex);
            });

            it('should error when the data returns as undefined', function() {
                spyOnTableGetCalls(undefined, tableData.length, definition.cols, undefined, undefined, undefined);
                table.onDataReceived();

                expect(table.state.data).toBeNull();
            });

            it('should show no results if the data returns with an empty array', function() {
                spyOnTableGetCalls([], tableData.length, definition.cols, undefined, undefined, undefined);
                table.onDataReceived();

                expect(table.state.data).toEqual([]);
                expect(function(){TestUtils.findRenderedDOMComponentWithClass(table, 'no-results');}).not.toThrow();
                expect(TestUtils.findRenderedDOMComponentWithClass(table, 'no-results').props.children).toEqual('No results found.');
            });
        });

        describe('onError function', function() {
            it('should set the state to an error state', function() {
                expect(table.state.dataError).toEqual(false);
                table.onError();

                expect(table.state.loading).toEqual(false);
                expect(table.state.dataError).toEqual(true);
            });
        });

        describe('getQuickFilter function', function() {
            it('should create an input element if the quickFilterEnabled property is set to true and the table is not loading', function() {
                table.state.data = tableData;
                table.state.loading = false;
                table.quickFilterEnabled = true;
                expect(table.getQuickFilter().type).toEqual('input');
                table.state.data = null;
            });

            it('should not create an element if there is no data to display', function(){
                table.state.data = null;
                expect(table.getQuickFilter()).toBeNull();
            });

            it('should not create an input element if the quickFilterEnabled property is set to false', function() {
                table.state.data = tableData;
                table.quickFilterEnabled = false;
                expect(table.getQuickFilter()).toBeNull();
                table.state.data = null;
            });
        });

        describe('getAdvancedFilters', function() {
            it('should return null if there are no advanced filters', function() {
                expect(table.getAdvancedFilters()).toBeNull();
            });

            it('should request the markup for each advanced filter', function() {
                table.state.loading = false;
                table.state.advancedFilters = [
                    {
                        dataProperty: 'archived',
                        filterValue: true,
                        label: 'Show Archived'
                    },
                    {
                        dataProperty: 'deleted',
                        filterValue: true,
                        label: 'Show Deleted'
                    }
                ];
                spyOn(table, 'getAdvancedFilterItemMarkup');

                table.getAdvancedFilters();

                expect(table.getAdvancedFilterItemMarkup.calls.count()).toEqual(2);
                expect(table.getAdvancedFilters().props.className).toEqual('advanced-filters');
            });
        });

        describe('getAdvancedFilterItemMarkup', function() {
            it('should return the markup for an advanced filter', function() {
                table.state.loading = false;
                table.state.advancedFilters = [
                    {
                        dataProperty: 'archived',
                        filterValue: true,
                        label: 'Show Archived'
                    }
                ];

                var markup = table.getAdvancedFilterItemMarkup(table.state.advancedFilters[0]);

                expect(markup.props.className).toEqual('advanced-filter-item');
                expect(markup.props.children[0].props.children).toEqual('Show Archived');
                expect(markup.props.children[1].type).toEqual('input');
                expect(markup.props.children[1].props.type).toEqual('checkbox');
                expect(markup.props.children[1].props.checked).toEqual(false);
            });
        });

        describe('getPaginationControls function', function() {
            it('should not generate controls if there is no data', function() {
                var dataCount = 0;
                var pagination = {
                    cursor: 1,
                    size: 2
                };
                spyOnTableGetCalls(tableData, dataCount, definition.cols, undefined, undefined, pagination);
                table.onDataReceived();
                table.setState({data: null});

                expect(function(){TestUtils.findRenderedDOMComponentWithClass(table, 'left-control fa fa-chevron-left')}).toThrow();
                expect(function(){TestUtils.findRenderedDOMComponentWithClass(table, 'right-control fa fa-chevron-right')}).toThrow();
            });

            it('should not generate controls if the data is an empty array', function() {
                var dataCount = 0;
                var pagination = {
                    cursor: 1,
                    size: 2
                };
                spyOnTableGetCalls(tableData, dataCount, definition.cols, undefined, undefined, pagination);
                table.onDataReceived();
                table.setState({data: []});

                expect(function(){TestUtils.findRenderedDOMComponentWithClass(table, 'left-control fa fa-chevron-left')}).toThrow();
                expect(function(){TestUtils.findRenderedDOMComponentWithClass(table, 'right-control fa fa-chevron-right')}).toThrow();
            });

            it('should not generate controls if pagination is not defined for the table', function() {
                var dataCount = 0;
                var pagination = {
                    cursor: 1,
                    size: 2
                };
                spyOnTableGetCalls(tableData, dataCount, definition.cols, undefined, undefined, pagination);
                table.onDataReceived();
                table.setState({pagination: null});

                expect(function(){TestUtils.findRenderedDOMComponentWithClass(table, 'left-control fa fa-chevron-left')}).toThrow();
                expect(function(){TestUtils.findRenderedDOMComponentWithClass(table, 'right-control fa fa-chevron-right')}).toThrow();
            });

            it('should enable the right and left clicks if not at the beginning or end of pagination', function() {
                var dataCount = 100;
                var pagination = {
                    cursor: 50,
                    size: 2
                };
                spyOnTableGetCalls(tableData, dataCount, definition.cols, undefined, undefined, pagination);
                table.onDataReceived();

                expect(function(){TestUtils.findRenderedDOMComponentWithClass(table, 'left-control fa fa-chevron-left')}).not.toThrow();
                expect(function(){TestUtils.findRenderedDOMComponentWithClass(table, 'right-control fa fa-chevron-right')}).not.toThrow();
                expect(function(){TestUtils.findRenderedDOMComponentWithClass(table, 'left-control disabled fa fa-chevron-left')}).toThrow();
                expect(function(){TestUtils.findRenderedDOMComponentWithClass(table, 'right-control disabled fa fa-chevron-right')}).toThrow();
            });

            it('should disable the left click if at the beginning of pagination', function() {
                var dataCount = 100;
                var pagination = {
                    cursor: 0,
                    size: 2
                };
                spyOnTableGetCalls(tableData, dataCount, definition.cols, undefined, undefined, pagination);
                table.onDataReceived();

                expect(function(){TestUtils.findRenderedDOMComponentWithClass(table, 'left-control disabled fa fa-chevron-left')}).not.toThrow();
                expect(function(){TestUtils.findRenderedDOMComponentWithClass(table, 'right-control disabled fa fa-chevron-right')}).toThrow();
            });

            it('should disable the right click if at the end of pagination', function() {
                var dataCount = 100;
                var pagination = {
                    cursor: 99,
                    size: 2
                };
                spyOnTableGetCalls(tableData, dataCount, definition.cols, undefined, undefined, pagination);
                table.onDataReceived();

                expect(function(){TestUtils.findRenderedDOMComponentWithClass(table, 'left-control disabled fa fa-chevron-left')}).toThrow();
                expect(function(){TestUtils.findRenderedDOMComponentWithClass(table, 'right-control disabled fa fa-chevron-right')}).not.toThrow();
            });

            it('should use pagination icons passed in on props if provided', function() {
                var dataCount = 100;
                var pagination = {
                    cursor: 99,
                    size: 2
                };

                var props = {
                    definition: definition,
                    componentId: id,
                    key: id,
                    filters: {},
                    iconClasses: iconClasses,
                    loadingIconClasses: ['icon', 'ion-loading-c']
                };
                table = TestUtils.renderIntoDocument(React.createElement(BasicTable, React.__spread({},  props)));

                spyOnTableGetCalls(tableData, dataCount, definition.cols, undefined, undefined, pagination);
                table.onDataReceived();

                expect(function(){TestUtils.findRenderedDOMComponentWithClass(table, 'test-page-left')}).not.toThrow();
                expect(function(){TestUtils.findRenderedDOMComponentWithClass(table, 'test-page-right')}).not.toThrow();
            });
        });

        describe('getColSortDirections function', function() {
            it('should create an array of col sort directions containing "ascending", "descending", and "off"', function() {
                var expectedDirections = ['ascending', 'descending', 'ascending', 'ascending', 'descending', 'off'];
                spyOnTableGetCalls(tableData, tableData.length, definition.cols, definition.sortColIndex, undefined, undefined);
                table.onDataReceived();

                expect(table.state.colSortDirections).toEqual(expectedDirections);
            });
        });

        describe('getTableRowItem function', function() {
            var rowData = {string: 'a', integer: 1};
            var index = 0;

            it('should create table row elements', function() {
                spyOnTableGetCalls(tableData, tableData.length, definition.cols, definition.sortColIndex, undefined, undefined);
                table.onDataReceived();

                expect(TestUtils.scryRenderedDOMComponentsWithTag(table, 'tr').length).toEqual(7);
            });

            it('should have a hover-enabled class if row clicks are defined', function() {
                table.state.rowClick = true;
                var tableRowComponent = table.getTableRowItem(rowData, index);

                expect(tableRowComponent.props.className).toEqual('hover-enabled text-select');
            });

            it('should not have a hover-enabled class if row clicks are not defined', function() {
                var tableRowComponent = table.getTableRowItem(rowData, index);

                expect(tableRowComponent.props.className).toEqual('text-select');
            });

            it ('should add classes for advancedFilters', function() {
                rowData.shownByAdvancedFilters = ['test1', 'test2'];
                var tableRowComponent = table.getTableRowItem(rowData, index);

                expect(tableRowComponent.props.className).toEqual('text-select table-filter-test1 table-filter-test2');
            });

            it('should have an onClick function if row clicks are defined', function() {
                table.state.rowClick = true;
                var tableRowComponent = table.getTableRowItem(rowData, index);

                expect(tableRowComponent.props.onClick).toBeDefined();
            });

            it('should not have an onClick function if row clicks are not defined', function() {
                var tableRowComponent = table.getTableRowItem(rowData, index);

                expect(tableRowComponent.props.onClick).not.toBeDefined();
            });

            it('should make calls to create table data elements', function() {
                table.state.colDefinitions = [
                    {
                        dataProperty: 'string',
                        dataType: 'string',
                        sortDirection: 'ascending'
                    },
                    {
                        dataProperty: 'integer',
                        sortDirection: 'descending'
                    }
                ];
                spyOn(table, 'getTableData');
                table.getTableRowItem(rowData, index);

                expect(table.getTableData.calls.count()).toEqual(2);
            });
        });

        describe('getTableHeaderItem function', function() {
            it('should create table header elements', function() {
                spyOnTableGetCalls(tableData, tableData.length, definition.cols, definition.sortColIndex, undefined, undefined);
                table.onDataReceived(tableData);

                expect(TestUtils.scryRenderedDOMComponentsWithTag(table, 'th').length).toEqual(6);
            });

            it('should create a bulk select table header if a column is defined with a dataType of select', function() {
                var def = _.cloneDeep(definition);
                def.cols.unshift({dataType: 'select', dataProperty: 'string'});
                spyOnTableGetCalls(tableData, tableData.length, def.cols, definition.sortColIndex, undefined, undefined);
                spyOn(table, 'getBulkSelectionIcon').and.callThrough();
                table.onDataReceived(tableData);

                expect(table.getBulkSelectionIcon.calls.count()).toEqual(1);
            });

            it('should create column sorting table headers if sorting is defined in the table definition.', function() {
                spyOnTableGetCalls(tableData, tableData.length, definition.cols, definition.sortColIndex, undefined, undefined);
                spyOn(table, 'getSortIcon').and.callThrough();
                table.onDataReceived(tableData);

                expect(table.getSortIcon.calls.count()).toEqual(5);
            });
        });

        describe('getBulkSelectionIcon function', function() {
            it('should display the select all icon if no items in the selected list match items in the filtered data set', function() {
                var def = _.cloneDeep(definition);
                def.cols.unshift({dataType: 'select', dataProperty: 'string'});
                spyOnTableGetCalls(tableData, tableData.length, def.cols, definition.sortColIndex, undefined, undefined);
                table.onDataReceived(tableData);
                table.state.filteredData = table.state.data;
                // Testing no items in selected list.
                table.state.selectedItems = {};

                expect(table.getBulkSelectionIcon(def.cols[0]).type).toEqual('i');
                expect(table.getBulkSelectionIcon(def.cols[0])._store.props.className).toEqual('fa fa fa-square-o');
                expect(table.getBulkSelectionIcon(def.cols[0])._store.props.title).toEqual('Select All');

                // Testing item in selected list that is not in filtered set.
                table.state.selectedItems = {'notInFilteredSet': true};

                expect(table.getBulkSelectionIcon(def.cols[0]).type).toEqual('i');
                expect(table.getBulkSelectionIcon(def.cols[0])._store.props.className).toEqual('fa fa fa-square-o');
                expect(table.getBulkSelectionIcon(def.cols[0])._store.props.title).toEqual('Select All');
            });

            it('should display the select all icon passed in on props', function() {
                var props = {
                    definition: definition,
                    componentId: id,
                    key: id,
                    filters: {},
                    iconClasses: iconClasses,
                    loadingIconClasses: ['icon', 'ion-loading-c']
                };
                var def = _.cloneDeep(definition);
                def.cols.unshift({dataType: 'select', dataProperty: 'string'});
                table = TestUtils.renderIntoDocument(React.createElement(BasicTable, React.__spread({},  props)));
                spyOnTableGetCalls(tableData, tableData.length, def.cols, definition.sortColIndex, undefined, undefined);
                table.onDataReceived();
                table.state.filteredData = table.state.data;
                table.state.selectedItems = {};

                expect(table.getBulkSelectionIcon(def.cols[0])._store.props.className).toEqual('test-select-all');
            });

            it('should display the deselect all icon if items in the selected list match items in the filtered data set', function() {
                var def = _.cloneDeep(definition);
                def.cols.unshift({dataType: 'select', dataProperty: 'string'});
                spyOnTableGetCalls(tableData, tableData.length, def.cols, definition.sortColIndex, undefined, undefined);
                table.onDataReceived(tableData);
                table.state.filteredData = table.state.data;
                table.state.selectedItems = {};
                table.state.selectedItems[table.state.data[0].string] = true;

                expect(table.getBulkSelectionIcon(def.cols[0]).type).toEqual('i');
                expect(table.getBulkSelectionIcon(def.cols[0])._store.props.className).toEqual('fa fa-minus-square-o');
                expect(table.getBulkSelectionIcon(def.cols[0])._store.props.title).toEqual('Deselect All');
            });

            it('should display the deselect all icon passed in on props', function() {
                var props = {
                    definition: definition,
                    componentId: id,
                    key: id,
                    filters: {},
                    iconClasses: iconClasses,
                    loadingIconClasses: ['icon', 'ion-loading-c']
                };
                var def = _.cloneDeep(definition);
                def.cols.unshift({dataType: 'select', dataProperty: 'string'});
                table = TestUtils.renderIntoDocument(React.createElement(BasicTable, React.__spread({},  props)));
                spyOnTableGetCalls(tableData, tableData.length, def.cols, definition.sortColIndex, undefined, undefined);
                table.onDataReceived();
                table.state.filteredData = table.state.data;
                table.state.selectedItems = {};
                table.state.selectedItems[table.state.data[0].string] = true;

                expect(table.getBulkSelectionIcon(def.cols[0])._store.props.className).toEqual('test-deselect-all');
            });
        });

        describe('getSortIcon function', function() {
            beforeEach(function() {
                spyOnTableGetCalls(tableData, tableData.length, definition.cols, definition.sortColIndex, undefined, undefined);
            });

            it('should display the fa-sort-asc icon and be active', function() {
                table.onDataReceived();

                expect(function(){TestUtils.findRenderedDOMComponentWithClass(table, 'active fa fa-sort-asc')}).not.toThrow();
                expect(function(){TestUtils.findRenderedDOMComponentWithClass(table, 'active fa fa-sort-desc')}).toThrow();
            });

            it('should display the sort asc icon passed in on props and be active', function() {
                var props = {
                    definition: definition,
                    componentId: id,
                    key: id,
                    filters: {},
                    iconClasses: iconClasses,
                    loadingIconClasses: ['icon', 'ion-loading-c']
                };
                table = TestUtils.renderIntoDocument(React.createElement(BasicTable, React.__spread({},  props)));
                table.onDataReceived();

                expect(function(){TestUtils.findRenderedDOMComponentWithClass(table, 'active test-sort-asc')}).not.toThrow();
                expect(function(){TestUtils.findRenderedDOMComponentWithClass(table, 'active test-sort-desc')}).toThrow();
            });

            it('should display the fa-sort-desc icon and be active', function() {
                definition.cols[0].sortDirection = 'descending';
                table.onDataReceived();

                expect(function(){TestUtils.findRenderedDOMComponentWithClass(table, 'active fa fa-sort-asc')}).toThrow();
                expect(function(){TestUtils.findRenderedDOMComponentWithClass(table, 'active fa fa-sort-desc')}).not.toThrow();

                // reset data
                definition.cols[0].sortDirection = 'ascending';
            });

            it('should display the sort desc icon passed in on props and be active', function() {
                var props = {
                    definition: definition,
                    componentId: id,
                    key: id,
                    filters: {},
                    iconClasses: iconClasses,
                    loadingIconClasses: ['icon', 'ion-loading-c']
                };
                definition.cols[0].sortDirection = 'descending';
                table = TestUtils.renderIntoDocument(React.createElement(BasicTable, React.__spread({},  props)));
                table.onDataReceived();

                expect(function(){TestUtils.findRenderedDOMComponentWithClass(table, 'active test-sort-asc')}).toThrow();
                expect(function(){TestUtils.findRenderedDOMComponentWithClass(table, 'active test-sort-desc')}).not.toThrow();

                // reset data
                definition.cols[0].sortDirection = 'ascending';
            });

            it('should display the fa-sort-desc icon for all columns defaulting to a ascending sort', function() {
                table.onDataReceived();

                expect(TestUtils.scryRenderedDOMComponentsWithClass(table, 'fa-sort-asc').length).toEqual(3);

            });

            it('should display the fa-sort-desc icon for all columns defaulting to a descending sort', function() {
                table.onDataReceived();

                expect(TestUtils.scryRenderedDOMComponentsWithClass(table, 'fa-sort-desc').length).toEqual(2);
            });
        });

        describe('getTableData function', function() {
            beforeEach(function() {
                spyOnTableGetCalls(tableData, tableData.length, definition.cols, definition.sortColIndex, undefined, undefined);
                table.onDataReceived();
            });
            it('should create table data elements', function() {
                expect(TestUtils.scryRenderedDOMComponentsWithTag(table, 'td').length).toEqual(42);
            });

            it('should render fa-circle icons after the status of an online user', function() {
                var val = Date.now() - 899999;
                var meta = {dataType: 'status', timeFormat: 'MMM Do, h A', online: true};
                table.state.data = [];
                table.state.data.push(meta);
                var tableDataComponent = table.getTableData(val, meta, null, 0);


                expect(tableDataComponent.props.children[1].props.className).toEqual('after-icon fa fa-circle status-on');
            });

            it('should use the status on icon passed in on props', function() {
                var props = {
                    definition: definition,
                    componentId: id,
                    key: id,
                    filters: {},
                    iconClasses: iconClasses,
                    loadingIconClasses: ['icon', 'ion-loading-c']
                };
                table = TestUtils.renderIntoDocument(React.createElement(BasicTable, React.__spread({},  props)));
                table.onDataReceived();

                var val = Date.now() - 899999;
                var meta = {dataType: 'status', timeFormat: 'MMM Do, h A', online: true};
                table.state.data = [];
                table.state.data.push(meta);
                var tableDataComponent = table.getTableData(val, meta, null, 0);

                expect(tableDataComponent.props.children[1].props.className).toEqual('after-icon test-status-on status-on');
            });

            it('should render fa-circle-o icons after the status of an offline user', function() {
                var val = Date.now() - 900001;
                var meta = {dataType: 'status', timeFormat: 'MMM Do, h A', online: false};
                table.state.data = [];
                table.state.data.push(meta);
                var tableDataComponent = table.getTableData(val, meta, null, 0);

                expect(tableDataComponent.props.children[1].props.className).toEqual('after-icon fa fa-circle-o status-off');
            });

            it('should use the status off icon passed in on props', function() {
                var props = {
                    definition: definition,
                    componentId: id,
                    key: id,
                    filters: {},
                    iconClasses: iconClasses,
                    loadingIconClasses: ['icon', 'ion-loading-c']
                };
                table = TestUtils.renderIntoDocument(React.createElement(BasicTable, React.__spread({},  props)));
                table.onDataReceived();

                var val = Date.now() - 900001;
                var meta = {dataType: 'status', timeFormat: 'MMM Do, h A', online: false};
                table.state.data = [];
                table.state.data.push(meta);
                var tableDataComponent = table.getTableData(val, meta, null, 0);

                expect(tableDataComponent.props.children[1].props.className).toEqual('after-icon test-status-off status-off');
            });

            it('should set different title attribute when hover value is passed in', function(){
                var tableDataComponent = table.getTableData('abc', {}, 'def');

                expect(tableDataComponent.props.children[0].props.children).toEqual('abc');
                expect(tableDataComponent.props.children[0].props.title).toEqual('def');
            });
        });

        describe('handleQuickFilterChange function', function() {
            it('should trigger filtering', function() {
                var event = {
                    target: {
                        value: 'testFilter'
                    }
                };

                spyOn(TableActions, 'filter');
                table.handleQuickFilterChange(event);

                expect(TableActions.filter).toHaveBeenCalledWith(id, event.target.value);
            });
        });

        describe('handleAdvancedFilterToggle function', function() {
            it('should trigger advanced filtering', function() {
                table.state.advancedFilters = [
                    {checked: null},{checked: false}
                ];

                spyOn(TableActions, 'advancedFilter');
                table.handleAdvancedFilterToggle(table.state.advancedFilters[0]);

                expect(TableActions.advancedFilter).toHaveBeenCalledWith(id, table.state.advancedFilters);

                table.handleAdvancedFilterToggle(table.state.advancedFilters[1]);
                expect(TableActions.advancedFilter).toHaveBeenCalledWith(id, table.state.advancedFilters);
            });
        });

        describe('handlePageLeftClick function', function() {
            it('should trigger pagination to the left', function() {
                spyOnTableGetCalls(tableData, tableData.length, definition.cols, undefined, undefined, definition.pagination);

                spyOn(TableActions, 'paginate');
                table.handlePageLeftClick();

                expect(TableActions.paginate).toHaveBeenCalledWith(id, 'left');
            });
        });

        describe('handlePageRightClick function', function() {
            it('should trigger pagination to the right', function() {
                spyOnTableGetCalls(tableData, tableData.length, definition.cols, undefined, undefined, definition.pagination);

                spyOn(TableActions, 'paginate');
                table.handlePageRightClick();

                expect(TableActions.paginate).toHaveBeenCalledWith(id, 'right');
            });
        });

        describe('handleSortClick function', function() {
            it('should trigger the handle sort click function when attempting to perform an ascending sort', function() {
                var index = 0;
                definition.cols[0].sortDirection = 'descending';

                spyOnTableGetCalls(tableData, tableData.length, definition.cols, definition.sortColIndex, undefined, undefined);
                table.onDataReceived();

                spyOn(TableActions, 'sortChange');

                table.handleSortClick(index);

                expect(TableActions.sortChange).toHaveBeenCalledWith(id, index, 'ascending');

                // reset data
                definition.cols[0].sortDirection = 'ascending';
            });

            it('should trigger the handle sort click function when attempting to perform a descending sort', function() {
                var index = 0;

                spyOnTableGetCalls(tableData, tableData.length, definition.cols, definition.sortColIndex, undefined, undefined);
                table.onDataReceived();

                spyOn(TableActions, 'sortChange');

                table.handleSortClick(index);

                expect(TableActions.sortChange).toHaveBeenCalledWith(id, index, 'descending');
            });

            it('should trigger the handle sort click function when attempting to sort an inactive sortable column', function() {
                var index = 1;

                spyOnTableGetCalls(tableData, tableData.length, definition.cols, definition.sortColIndex, undefined, undefined);
                table.onDataReceived();

                spyOn(TableActions, 'sortChange');

                table.handleSortClick(index);

                expect(TableActions.sortChange).toHaveBeenCalledWith(id, index, 'descending');
            });
        });

        describe('onMouseDown function', function() {
            it('should store the client x value of the mouse down event', function() {
                var e = {
                    clientX: 100
                };
                spyOnTableGetCalls(tableData, tableData.length, definition.cols, undefined, definition.rowClick, undefined);
                table.onDataReceived();
                table.onMouseDown(e);

                expect(table.mouseDownX).toEqual(e.clientX);
            });
        });

        describe('handleRowClick function', function() {
            it('should trigger the rowClick callback', function() {
                var e = {
                    currentTarget: {
                        rowIndex: 0
                    }
                };
                spyOnTableGetCalls(tableData, tableData.length, definition.cols, undefined, definition.rowClick, undefined);
                spyOn(definition.rowClick, 'callback');
                table.onDataReceived();

                table.handleRowClick(e);
                expect(definition.rowClick.callback).toHaveBeenCalled();
            });

            it('should throw an error if the callback is not a function', function() {
                spyOnTableGetCalls(tableData, tableData.length, definition.cols, undefined, 'error', undefined);
                spyOn(definition.rowClick, 'callback');
                table.onDataReceived();

                expect(function() {table.handleRowClick();}).toThrow();
                expect(definition.rowClick.callback).not.toHaveBeenCalled();
            });

            it('should not execute the rowClick callback if the user dragged the mouse more than 10 pixels', function() {
                var e = {
                    clientX: 111
                };
                spyOnTableGetCalls(tableData, tableData.length, definition.cols, undefined, definition.rowClick, undefined);
                spyOn(definition.rowClick, 'callback');
                table.onDataReceived();

                // Drag right.
                table.mouseDownX = 100;
                table.handleRowClick(e);
                expect(definition.rowClick.callback).not.toHaveBeenCalled();

                // Drag left.
                table.mouseDownX = 122;
                table.handleRowClick(e);
                expect(definition.rowClick.callback).not.toHaveBeenCalled();
            });

            it('should execute the rowClick callback if the user dragged the mouse less than 11 pixels', function() {
                var e = {
                    clientX: 110
                };
                spyOnTableGetCalls(tableData, tableData.length, definition.cols, undefined, definition.rowClick, undefined);
                spyOn(definition.rowClick, 'callback');
                table.onDataReceived();

                // Drag right.
                table.mouseDownX = 100;
                table.handleRowClick(e);
                expect(definition.rowClick.callback.calls.count()).toEqual(1);

                // Drag left.
                table.mouseDownX = 120;
                table.handleRowClick(e);
                expect(definition.rowClick.callback.calls.count()).toEqual(2);
            });
        });

        describe('handleBulkSelectClick', function() {
            it('should execute the table actions toggleBulkSelect function and not propagate the click through to the row', function() {
                var deselect = false;
                var e = {stopPropagation: function(){}};
                spyOn(e, 'stopPropagation');
                spyOn(TableActions, 'toggleBulkSelect');
                spyOnTableGetCalls(tableData, tableData.length, definition.cols, undefined, definition.rowClick, undefined);
                table.onDataReceived();

                table.handleBulkSelectClick(deselect, e);

                expect(e.stopPropagation).toHaveBeenCalled();
                expect(TableActions.toggleBulkSelect).toHaveBeenCalledWith(id, deselect);
            });
        });

        describe('handleSelectClick', function() {
            it('should execute the table actions toggleRowSelect function and not propagate the click through to the row', function() {
                var e = {
                    stopPropagation: function(){},
                    currentTarget: {parentNode: {rowIndex: 0}}
                };
                spyOn(e, 'stopPropagation');
                spyOn(TableActions, 'toggleRowSelect');
                spyOnTableGetCalls(tableData, tableData.length, definition.cols, undefined, definition.rowClick, undefined);
                table.onDataReceived();

                table.handleSelectClick(e);

                expect(e.stopPropagation).toHaveBeenCalled();
                expect(TableActions.toggleRowSelect).toHaveBeenCalledWith(id, 0);
            });
        });
    });
});
