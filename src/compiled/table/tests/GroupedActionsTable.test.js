define(function(require) {
    var GroupedActionsTable = require('drc/table/GroupedActionsTable');
    var Moment = require('moment');
    var React = require('react');
    var TableActions = require('drc/table/TableActions');
    var TableStore = require('drc/table/TableStore');
    var Utils = require('drc/utils/Utils');

    var TestUtils = React.addons.TestUtils;

    describe('Grouped Actions Table', function() {
        var table, id;

        function spyOnTableGetCalls(data, count, colDef, sortIdx, rowClick, pagination) {
            var tableInstance = TableStore.getInstance(id);

            spyOn(tableInstance, 'getData').and.returnValue(data);
            spyOn(tableInstance, 'getDataCount').and.returnValue(count);
            spyOn(tableInstance, 'getColDefinitions').and.returnValue(colDef);
            spyOn(tableInstance, 'getSortColIndex').and.returnValue(sortIdx);
            spyOn(tableInstance, 'getRowClickData').and.returnValue(rowClick);
            spyOn(tableInstance, 'getPaginationData').and.returnValue(pagination);
        }

        var definition = {
            url: 'table/groupedActions',
            cols: [
                {
                    headerLabel: 'DATE',
                    dataProperty: 'groupDate',
                    sortDirection: 'descending',
                    dataType: 'time',
                    timeFormat: 'MMM Do, YYYY',
                    width: '33%'
                },
                {
                    headerLabel: 'DURATION',
                    dataProperty: 'duration',
                    sortDirection: 'descending',
                    dataType: 'number',
                    width: '33%'
                },
                {
                    headerLabel: 'INTERACTIONS',
                    dataProperty: 'totalCount',
                    sortDirection: 'descending',
                    dataType: 'number',
                    width: '33%'
                }
            ],
            sortColIndex: 0,
            pagination: {
                cursor: 0,
                size: 10
            },
            rowClick: {
                callback: function() {}
            }
        };
        var tableData = [
            {
                actions: [
                    {"actionCount": 1, "flowID": "27de1a9f8240", "start": "2015-02-04T15:25:34.931Z", "end": "2015-02-04T15:25:34.931Z"},
                    {"actionCount": 1, "flowID": "93ccd10638b7", "start": "2015-02-04T15:30:05.553Z", "end": "2015-02-04T15:30:05.553Z"},
                    {"actionCount": 5, "flowID": "905e0cd6705d", "start": "2015-02-04T16:30:20.484Z", "end": "2015-02-04T16:39:18.283Z"},
                    {"actionCount": 1, "flowID": "c6fd4a9cbc10", "start": "2015-02-04T16:33:30.874Z", "end": "2015-02-04T16:33:30.874Z"}
                ],
                duration: 717799,
                groupDate: new Date(Number(1422946800000)),
                totalCount: 8
            },
            {
                actions: [
                    {"actionCount": 2, "flowID": "ac552e1353b6", "start": "2015-02-03T15:00:06.805Z", "end": "2015-02-03T15:00:11.925Z"},
                    {"actionCount": 3, "flowID": "1d29487c8479", "start": "2015-02-03T15:00:51.138Z", "end": "2015-02-03T15:01:10.636Z"},
                    {"actionCount": 7, "flowID": "6fd5ca91b1b9", "start": "2015-02-03T16:15:08.046Z", "end": "2015-02-03T16:16:09.081Z"},
                    {"actionCount": 1, "flowID": "38f1dfa45704", "start": "2015-02-03T16:25:32.808Z", "end": "2015-02-03T16:25:32.808Z"},
                    {"actionCount": 5, "flowID": "9e82f5db596e", "start": "2015-02-03T16:26:52.387Z", "end": "2015-02-03T16:27:23.423Z"},
                    {"actionCount": 1, "flowID": "cf880ac198b2", "start": "2015-02-03T16:27:00.526Z", "end": "2015-02-03T16:27:00.526Z"},
                    {"actionCount": 1, "flowID": "23ab0015ba4a", "start": "2015-02-03T17:29:32.542Z", "end": "2015-02-03T17:29:32.542Z"},
                    {"actionCount": 3, "flowID": "60e955671b46", "start": "2015-02-03T18:08:37.281Z", "end": "2015-02-03T18:09:24.977Z"},
                    {"actionCount": 3, "flowID": "d9fc919f16bb", "start": "2015-02-03T18:10:21.815Z", "end": "2015-02-03T18:10:58.814Z"},
                    {"actionCount": 9, "flowID": "ed6c2f3f854e", "start": "2015-02-03T18:11:11.009Z", "end": "2015-02-03T18:15:22.864Z"},
                    {"actionCount": 2, "flowID": "d63365a1129e", "start": "2015-02-03T18:36:10.882Z", "end": "2015-02-03T18:36:20.156Z"},
                    {"actionCount": 16, "flowID": "b15606bcca9b", "start": "2015-02-03T18:45:04.269Z", "end": "2015-02-03T18:59:07.124Z"},
                    {"actionCount": 20, "flowID": "7c78a0be74b1", "start": "2015-02-03T18:47:39.458Z", "end": "2015-02-03T19:02:35.827Z"},
                    {"actionCount": 17, "flowID": "a49b376e64c9", "start": "2015-02-03T18:53:26.420Z", "end": "2015-02-03T19:01:19.893Z"},
                    {"actionCount": 3, "flowID": "b25b8b05db1a", "start": "2015-02-03T19:21:10.496Z", "end": "2015-02-03T19:32:23.331Z"},
                    {"actionCount": 1, "flowID": "c633ea05e47c", "start": "2015-02-03T19:21:13.617Z", "end": "2015-02-03T19:21:13.617Z"},
                    {"actionCount": 11, "flowID": "992499a7889d", "start": "2015-02-03T19:34:21.743Z", "end": "2015-02-03T19:47:07.384Z"},
                    {"actionCount": 3, "flowID": "5021f94d86e3", "start": "2015-02-03T21:50:51.943Z", "end": "2015-02-03T22:00:20.182Z"},
                    {"actionCount": 1, "flowID": "b5d9474ad058", "start": "2015-02-03T22:00:11.871Z", "end": "2015-02-03T22:00:11.871Z"},
                    {"actionCount": 1, "flowID": "3ee2be8cd5ff", "start": "2015-02-03T22:00:34.191Z", "end": "2015-02-03T22:00:34.191Z"},
                    {"actionCount": 3, "flowID": "077d47800dcb", "start": "2015-02-03T22:10:48.394Z", "end": "2015-02-03T22:27:11.876Z"},
                    {"actionCount": 1, "flowID": "84749f211010", "start": "2015-02-03T22:20:38.368Z", "end": "2015-02-03T22:20:38.368Z"},
                    {"actionCount": 2, "flowID": "7f6ae1ac3600", "start": "2015-02-03T22:44:20.155Z", "end": "2015-02-03T22:44:45.744Z"},
                    {"actionCount": 1, "flowID": "12f89870aba6", "start": "2015-02-03T23:19:46.461Z", "end": "2015-02-03T23:19:46.461Z"}
                ],
                duration: 6170996,
                groupDate: new Date(Number(1423033200000)),
                totalCount: 117
            }
        ];
        var dataCount = tableData.length;
        var iconClasses = {
            rowsCollapsed: 'test-rows-collapsed',
            rowsExpanded: 'test-rows-expanded'
        };

        beforeEach(function() {
            id = 'table-' + Utils.guid();
            var props = {
                type: 'groupedActions',
                definition: definition,
                componentId: id,
                key: id,
                filters: {},
                loadingIconClasses: ['icon', 'ion-loading-c']
            };

            table = TestUtils.renderIntoDocument(React.createElement(GroupedActionsTable, React.__spread({},  props)));
            table.requestData();
            spyOnTableGetCalls(tableData, dataCount, definition.cols, definition.sortColIndex, definition.rowClick, definition.pagination);
            table.onDataReceived();
        });

        describe('getTableRowItem function', function() {
            it ('should make calls to create table data elements.', function() {
                spyOn(table, 'getTableData');
                table.onDataReceived();

                expect(table.getTableData.calls.count()).toEqual(6);
            });

            it ('should create table row elements.', function() {
                expect(TestUtils.scryRenderedDOMComponentsWithTag(table, 'tr').length).toEqual(2);
            });

            it ('should create rows with a hover class and a text-select class.', function() {
                expect(TestUtils.scryRenderedDOMComponentsWithTag(table, 'tr')[0].props.className).toEqual('hover-enabled text-select');
            });

            it ('should assign an onClick function to each of the rows.', function() {
                expect(TestUtils.scryRenderedDOMComponentsWithTag(table, 'tr')[0].props.onClick).toBeFunction();
            });

            it ('should create nested table rows for the selected row.', function() {
                TestUtils.Simulate.click(TestUtils.scryRenderedDOMComponentsWithTag(table, 'tr')[0]);
                expect(TestUtils.scryRenderedDOMComponentsWithTag(table, 'tr').length).toEqual(6);

                TestUtils.Simulate.click(TestUtils.scryRenderedDOMComponentsWithTag(table, 'tr')[5]);
                expect(TestUtils.scryRenderedDOMComponentsWithTag(table, 'tr').length).toEqual(26);
            });

            it ('should add a sub-action class to nested table rows.', function() {
                TestUtils.Simulate.click(TestUtils.scryRenderedDOMComponentsWithTag(table, 'tr')[0]);
                expect(TestUtils.scryRenderedDOMComponentsWithTag(table, 'tr')[1].props.className).toEqual('hover-enabled text-select sub-action');
            });

            it ('should make calls to get nested the nested row\'s table data elements', function() {
                spyOn(table, 'getNestedRowTableData');
                TestUtils.Simulate.click(TestUtils.scryRenderedDOMComponentsWithTag(table, 'tr')[0]);
                table.onDataReceived();

                expect(table.getNestedRowTableData.calls.count()).toEqual(24);
            });

            it ('should not create any nested rows if no row is selected.', function() {
                spyOn(table, 'getNestedRowTableData');
                table.onDataReceived();

                expect(table.getNestedRowTableData).not.toHaveBeenCalled();
            });
        });

        describe('getTableData function', function() {
            it('should set the value to a calculated duration string if the dataProperty is "duration".', function() {
                var tableDataElement = table.getTableData(tableData[0], definition.cols[1], 0);
                var tableDataContents = tableDataElement._store.props.children[1];
                var title = tableDataContents._store.props.title;
                var str = tableDataContents._store.props.children;
                expect(title).toBeNonEmptyString();
                expect(str).toEqual('12m');
            });

            it('should display the number of nested rows and a rowsCollapsed icon if the dataProperty is "groupDate".', function() {
                var tableDataElement = table.getTableData(tableData[0], definition.cols[0], 0);
                var beforeElement = tableDataElement._store.props.children[0];
                var span = beforeElement._store.props.children[0];
                var icon = beforeElement._store.props.children[1];
                expect(span).toEqual(4);
                expect(icon._store.props.className).toEqual('fa fa-chevron-right');
            });

            it('should display the number of nested rows and a rowsCollapsed icon from props if the dataProperty is "groupDate".', function() {
                var props = {
                    type: 'groupedActions',
                    definition: definition,
                    componentId: id,
                    key: id,
                    filters: {},
                    iconClasses: iconClasses,
                    loadingIconClasses: ['icon', 'ion-loading-c']
                };
                table = TestUtils.renderIntoDocument(React.createElement(GroupedActionsTable, React.__spread({},  props)));
                table.onDataReceived();

                var tableDataElement = table.getTableData(tableData[0], definition.cols[0], 0);
                var beforeElement = tableDataElement._store.props.children[0];
                var icon = beforeElement._store.props.children[1];
                expect(icon._store.props.className).toEqual('test-rows-collapsed');
            });

            it('should display the number of nested rows and a rowsExpanded icon if the dataProperty is "groupDate" and the row was clicked.', function() {
                TestUtils.Simulate.click(TestUtils.scryRenderedDOMComponentsWithTag(table, 'tr')[0]);
                var tableDataElement = table.getTableData(tableData[0], definition.cols[0], 0);
                var beforeElement = tableDataElement._store.props.children[0];
                var span = beforeElement._store.props.children[0];
                var icon = beforeElement._store.props.children[1];
                expect(span).toEqual(4);
                expect(icon._store.props.className).toEqual('fa fa-chevron-down');
            });

            it('should display the number of nested rows and a rowsExpanded icon from props if the dataProperty is "groupDate" and the row was clicked.', function() {
                var props = {
                    type: 'groupedActions',
                    definition: definition,
                    componentId: id,
                    key: id,
                    filters: {},
                    iconClasses: iconClasses,
                    loadingIconClasses: ['icon', 'ion-loading-c']
                };
                table = TestUtils.renderIntoDocument(React.createElement(GroupedActionsTable, React.__spread({},  props)));
                table.onDataReceived();
                TestUtils.Simulate.click(TestUtils.scryRenderedDOMComponentsWithTag(table, 'tr')[0]);

                var tableDataElement = table.getTableData(tableData[0], definition.cols[0], 0);
                var beforeElement = tableDataElement._store.props.children[0];
                var icon = beforeElement._store.props.children[1];
                expect(icon._store.props.className).toEqual('test-rows-expanded');
            });

            it('should create a table data element.', function() {
                expect(TestUtils.scryRenderedDOMComponentsWithTag(table, 'td').length).toEqual(6);
            });
        });

        describe('componentDidUpdate function', function() {
            it('should find the wrapper divs to animate when clicking on a table row with nested rows.', function() {
                spyOn($, 'find');
                TestUtils.Simulate.click(TestUtils.scryRenderedDOMComponentsWithTag(table, 'tr')[0]);
                expect($.find.calls.count()).toEqual(1);
            });
        });

        describe('getNestedRowTableData function', function() {
            it('should not return table data if there is not a start time on the action.', function() {
                spyOn(Utils, 'calculateTimeString').and.callThrough();
                spyOn(table, 'calculateDurationString').and.callThrough();
                var action = _.cloneDeep(tableData[0].actions[0]);
                delete action.start;
                var nestedTableDataElement = table.getNestedRowTableData(action, definition.cols[0], 0);
                expect(nestedTableDataElement).toBeNull();
                expect(Utils.calculateTimeString).not.toHaveBeenCalled();
                expect(table.calculateDurationString).not.toHaveBeenCalled();
            });

            it('should not return table data if there is not an end time on the action.', function() {
                spyOn(Utils, 'calculateTimeString').and.callThrough();
                spyOn(table, 'calculateDurationString').and.callThrough();
                var action = _.cloneDeep(tableData[0].actions[0]);
                delete action.end;
                var nestedTableDataElement = table.getNestedRowTableData(action, definition.cols[0], 0);
                expect(nestedTableDataElement).toBeNull();
                expect(Utils.calculateTimeString).not.toHaveBeenCalled();
                expect(table.calculateDurationString).not.toHaveBeenCalled();
            });

            it('should set the value to a calculated time string from the action duration if the data property is "groupDate".', function() {
                spyOn(Utils, 'calculateTimeString').and.callThrough();
                spyOn(table, 'calculateDurationString').and.callThrough();
                var nestedTableDataElement = table.getNestedRowTableData(tableData[0].actions[0], definition.cols[0], 0);
                var tableDataContents = nestedTableDataElement._store.props.children;
                var title = tableDataContents._store.props.title;
                var str = tableDataContents._store.props.children;
                expect(title).toBeNonEmptyString();
                expect(str).toBeNonEmptyString();
                expect(Utils.calculateTimeString).toHaveBeenCalled();
                expect(table.calculateDurationString).not.toHaveBeenCalled();
            });

            it('should set the value to a calculated duration string from new Date objects if the data property is "duration".', function() {
                spyOn(Utils, 'calculateTimeString').and.callThrough();
                spyOn(table, 'calculateDurationString').and.callThrough();
                var nestedTableDataElement = table.getNestedRowTableData(tableData[0].actions[0], definition.cols[1], 0);
                var tableDataContents = nestedTableDataElement._store.props.children;
                var title = tableDataContents._store.props.title;
                var str = tableDataContents._store.props.children;
                expect(title).toBeNonEmptyString();
                expect(str).toBeNonEmptyString();
                expect(Utils.calculateTimeString).not.toHaveBeenCalled();
                expect(table.calculateDurationString).toHaveBeenCalled();
            });

            it('should set the value to a action count if the data property is "totalCount".', function() {
                spyOn(Utils, 'calculateTimeString').and.callThrough();
                spyOn(table, 'calculateDurationString').and.callThrough();
                var nestedTableDataElement = table.getNestedRowTableData(tableData[0].actions[0], definition.cols[2], 0);
                var tableDataContents = nestedTableDataElement._store.props.children;
                var title = tableDataContents._store.props.title;
                var str = tableDataContents._store.props.children;
                expect(title).toEqual(1);
                expect(str).toEqual(1);
                expect(Utils.calculateTimeString).not.toHaveBeenCalled();
                expect(table.calculateDurationString).not.toHaveBeenCalled();
            });
        });

        describe('calculateDurationString function', function() {
            it('should return the number of minutes in an interval.', function() {
                var action = tableData[0].actions[2];
                var val = table.calculateDurationString(new Date(action.end).getTime() - new Date(action.start).getTime());
                expect(val).toEqual('9m');
            });

            it('should return the number of minutes in an interval as 1 minute if the duration is very short.', function() {
                var action = tableData[0].actions[0];
                var val = table.calculateDurationString(new Date(action.end).getTime() - new Date(action.start).getTime());
                expect(val).toEqual('1m');
            });
        });

        describe('handleGroupRowClick function', function() {
            it('should set the selectedIndex on the table\'s state object', function() {
                expect(table.state.selectedIndex).toBeUndefined();
                TestUtils.Simulate.click(TestUtils.scryRenderedDOMComponentsWithTag(table, 'tr')[0]);
                expect(table.state.selectedIndex).toEqual(0);
            });

            it('should set the selectedIndex on the table\'s state object to -1 if closing an expanded row.', function() {
                expect(table.state.selectedIndex).toBeUndefined();
                TestUtils.Simulate.click(TestUtils.scryRenderedDOMComponentsWithTag(table, 'tr')[0]);
                expect(table.state.selectedIndex).toEqual(0);
                TestUtils.Simulate.click(TestUtils.scryRenderedDOMComponentsWithTag(table, 'tr')[0]);
                expect(table.state.selectedIndex).toEqual(-1);
            });
        });
    });
});
