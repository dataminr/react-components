var Moment = require('moment');
var TableActions = require('../TableActions');
var TableStore = require('../TableStore');
var Utils = require('../../utils/Utils');

var ActionTypes = TableActions.actionTypes;

describe('TableStore', function() {
    var id;
    var definition = {};
    var dataFormatter = function(data) {
        return data;
    };

    beforeEach(function() {
        id = 'table-' + Utils.guid();

        definition.url = '/test/url';
        definition.sortColIndex = 0;
        definition.cols = [
            {
                dataProperty: 'string',
                dataType: 'string',
                sortDirection: 'ascending',
                quickFilter: true
            },
            {
                dataProperty: 'integer',
                dataType: 'number',
                sortDirection: 'descending',
                quickFilter: true
            },
            {
                dataProperty: 'mixedCase',
                dataType: 'string',
                sortDirection: 'ascending'
            },
            {
                dataProperty: 'time',
                dataType: 'time',
                timeFormat: 'MMM Do, h A',
                sortDirection: 'ascending',
                quickFilter: true
            },
            {
                dataProperty: 'percent',
                dataType: 'percent',
                sortDirection: 'descending',
                quickFilter: true
            },
            {
                dataProperty: 'status',
                dataType: 'status',
                timeFormat: function(value) {
                    if(value > Moment('1970-01-17').startOf('d')) {
                        return Moment(value).format('h:mm A');
                    }
                    return Moment(value).format('MMM Do YYYY');
                },
                sortDirection: 'descending',
                quickFilter: true
            },
            {
                dataProperty: 'duration',
                dataType: 'duration',
                sortDirection: 'descending'
            },
            {
                dataProperty: 'durationToHours',
                dataType: 'duration',
                durationFormat: 'hours',
                sortDirection: 'descending'
            },
            {
                dataProperty: 'durationToMilliseconds',
                dataType: 'duration',
                durationFormat: 'milliseconds',
                sortDirection: 'descending'
            }
        ];
        definition.data = [
            {string: 'aaa', integer: -2, mixedCase: 'Aaa', time: 1417455952, percent: 14, status: 1417455952, duration: 1234, durationToHours: 1234, durationToMilliseconds: 1234},
            {string: 'b', integer: 3, mixedCase: 'B', percent: 14, duration: 59999, durationToHours: 59999, durationToMilliseconds: 59999},
            {string: 'a', integer: 0, mixedCase: 'a', time: 1416591981, percent: 43, status: 1416591981, duration: 123456789, durationToHours: 123456789, durationToMilliseconds: 123456789},
            {string: 'aa', integer: 2, mixedCase: 'Aa', time: 1417715098, percent: 78, status: 1417715098, duration: 123456, durationToHours: 123456, durationToMilliseconds: 123456},
            {string: 'aab', integer: -1, mixedCase: 'aAb', percent: 13, duration: 12345678912, durationToHours: 12345678912, durationToMilliseconds: 12345678912},
            {string: 'ab', integer: 1, mixedCase: 'aB', percent: 76, duration: 122436789, durationToHours: 122436789, durationToMilliseconds: 122436789},
            {string: 'aba', integer: 1, mixedCase: 'aBA', time: 1406479597, percent: 99, status: 1406479597, duration: 60000, durationToHours: 60000, durationToMilliseconds: 60000}
        ];
        definition.pagination = {
            cursor: 3,
            size: 2
        };
        TableStore.createInstance(id, definition, dataFormatter);
    });

    describe('Table', function() {
        var table;

        beforeEach(function() {
            table = new TableStore.Table(id, definition, null);
        });

        describe('onDataReceived function', function() {
            var origDefinition = _.cloneDeep(definition);
            var val = 'data';
            var val2 = 'data2';
            var data = [{test: val}, {test2: val2}];

            it('should set the data for the table', function() {
                spyOn(table, 'sortData');
                expect(table.data).toBeNull();
                table.onDataReceived(data);
                expect(table.data).not.toBeNull();
            });

            it('should call formatter if present', function() {
                table = new TableStore.Table(id, definition, dataFormatter);
                spyOn(table, 'sortData');
                spyOn(table, 'dataFormatter').and.returnValue(data);

                table.onDataReceived(data);
                expect(table.dataFormatter).toHaveBeenCalled();
            });

            it('should reset selected items', function(){
                spyOn(table, 'sortData');
                expect(table.data).toBeNull();
                table.selectedItems = {foo: 'bar'};
                table.onDataReceived(data);
                expect(table.data).not.toBeNull();
                expect(table.selectedItems).toEqual({});
            });

            it('should reset quick filter data', function(){
                spyOn(table, 'sortData');
                expect(table.data).toBeNull();
                table.filterValue = 'abc';
                table.onDataReceived(data);
                expect(table.data).not.toBeNull();
                expect(table.filterValue).toBeEmptyString();
            });

            describe('percent formatter', function() {
                it('should correctly format a percent dataType', function() {
                    table.onDataReceived(definition.data);

                    expect(table.data[0].percent).toEqual('43%');
                });
            });

            describe('time formatter', function() {
                it('should format the time and keep track of the original timestamp', function() {
                    table.onDataReceived(definition.data);

                    expect(table.data[0].time).toBeNonEmptyString();
                    expect(table.data[0].timeTimestamp).toEqual(1416591981);

                    expect(table.data[0].time).toEqual('Jan 17th, 2 AM');
                    expect(table.data[0].status).toEqual('2:29 AM');
                    expect(table.data[1].time).toEqual('Jan 17th, 2 AM');
                    expect(table.data[1].status).toEqual('2:48 AM');
                    expect(table.data[2].time).toEqual('Jan 17th, 2 AM');
                    expect(table.data[2].status).toEqual('2:44 AM');
                    expect(table.data[3].time).toEqual('--');
                    expect(table.data[3].status).toEqual('--');
                    expect(table.data[4].time).toEqual('--');
                    expect(table.data[4].status).toEqual('--');
                    expect(table.data[5].time).toEqual('Jan 16th, 11 PM');
                    expect(table.data[5].status).toEqual('Jan 16th 1970');
                    expect(table.data[6].time).toEqual('--');
                    expect(table.data[6].status).toEqual('--');
                });
            });

            describe('status formatter', function() {
                it('should set a default onlineLimit if the column is a status column and the onlineLimit was not set', function() {
                    table.onDataReceived(definition.data);

                    expect(table.cols[5].onlineLimit).toEqual(15);
                });

                it('should set a default onlineLimit if the column is a status column and the onlineLimit is not a number', function() {
                    definition.cols[5].onlineLimit = '5';
                    table.onDataReceived(definition.data);

                    expect(table.cols[5].onlineLimit).toEqual(15);
                });

                it('should set a default onlineLimit if the column is a status column and the onlineLimit is not greater than 1', function() {
                    definition.cols[5].onlineLimit = 0.5;
                    table.onDataReceived(definition.data);

                    expect(table.cols[5].onlineLimit).toEqual(15);
                });

                it('should use the set onlineLimit if the column is a status column and the onlineLimit was set correctly', function() {
                    definition.cols[5].onlineLimit = 5;
                    table.onDataReceived(definition.data);

                    expect(table.cols[5].onlineLimit).toEqual(5);
                });

                it('should correctly format the time and keep track of the original timestamp', function() {
                    table.onDataReceived(definition.data);

                    expect(table.data[0].status).toBeNonEmptyString();
                    expect(table.data[0].statusTimestamp).toEqual(1416591981);
                });

                it('should set the online attribute of a data element to true if the time is within the onlineLimit', function() {
                    definition.cols[5].onlineLimit = 15;
                    definition.data[0].status = Moment().subtract(1, 'minutes').valueOf();
                    spyOn(table, 'sortData');
                    table.onDataReceived(definition.data);

                    expect(table.data[0].online).toBeTruthy();
                });

                it('should set the online attribute of a data element to true if the time is not within the onlineLimit', function() {
                    definition.cols[5].onlineLimit = 15;
                    definition.data[0].status = Moment().subtract(16, 'minutes').valueOf();
                    spyOn(table, 'sortData');
                    table.onDataReceived(definition.data);

                    expect(table.data[0].online).toBeFalsy();
                });
            });

            describe('duration formatter', function() {
                it('should format the time and keep track of the original timestamp', function() {
                    table.onDataReceived(definition.data);

                    expect(table.data[0].duration).toEqual('1d 10h 17m');
                    expect(table.data[0].durationDuration).toEqual(123456789);
                    expect(table.data[0].durationToHours).toEqual('1d 10h');
                    expect(table.data[0].durationToHoursDuration).toEqual(123456789);
                    expect(table.data[0].durationToMilliseconds).toEqual('1d 10h 17m 36s 789ms');
                    expect(table.data[0].durationToMillisecondsDuration).toEqual(123456789);

                    expect(table.data[1].duration).toEqual('2m');
                    expect(table.data[1].durationDuration).toEqual(123456);
                    expect(table.data[1].durationToHours).toEqual('');
                    expect(table.data[1].durationToHoursDuration).toEqual(123456);
                    expect(table.data[1].durationToMilliseconds).toEqual('2m 3s 456ms');
                    expect(table.data[1].durationToMillisecondsDuration).toEqual(123456);

                    expect(table.data[2].duration).toEqual('');
                    expect(table.data[2].durationDuration).toEqual(1234);
                    expect(table.data[2].durationToHours).toEqual('');
                    expect(table.data[2].durationToHoursDuration).toEqual(1234);
                    expect(table.data[2].durationToMilliseconds).toEqual('1s 234ms');
                    expect(table.data[2].durationToMillisecondsDuration).toEqual(1234);

                    expect(table.data[3].duration).toEqual('142d 21h 21m');
                    expect(table.data[3].durationDuration).toEqual(12345678912);
                    expect(table.data[3].durationToHours).toEqual('142d 21h');
                    expect(table.data[3].durationToHoursDuration).toEqual(12345678912);
                    expect(table.data[3].durationToMilliseconds).toEqual('142d 21h 21m 18s 912ms');
                    expect(table.data[3].durationToMillisecondsDuration).toEqual(12345678912);

                    expect(table.data[4].duration).toEqual('1d 10h 0m');
                    expect(table.data[4].durationDuration).toEqual(122436789);
                    expect(table.data[4].durationToHours).toEqual('1d 10h');
                    expect(table.data[4].durationToHoursDuration).toEqual(122436789);
                    expect(table.data[4].durationToMilliseconds).toEqual('1d 10h 0m 36s 789ms');
                    expect(table.data[4].durationToMillisecondsDuration).toEqual(122436789);

                    expect(table.data[5].duration).toEqual('1m');
                    expect(table.data[5].durationDuration).toEqual(60000);
                    expect(table.data[5].durationToHours).toEqual('');
                    expect(table.data[5].durationToHoursDuration).toEqual(60000);
                    expect(table.data[5].durationToMilliseconds).toEqual('1m 0s 0ms');
                    expect(table.data[5].durationToMillisecondsDuration).toEqual(60000);

                    expect(table.data[6].duration).toEqual('');
                    expect(table.data[6].durationDuration).toEqual(59999);
                    expect(table.data[6].durationToHours).toEqual('');
                    expect(table.data[6].durationToHoursDuration).toEqual(59999);
                    expect(table.data[6].durationToMilliseconds).toEqual('59s 999ms');
                    expect(table.data[6].durationToMillisecondsDuration).toEqual(59999);
                });
            });

            it('should not error if there is not a sortColIndex defined', function() {
                table.sortColIndex = null;
                expect(function(){table.onDataReceived(data);}).not.toThrow();
            });

            // Reset definition
            definition = origDefinition;
        });

        describe('errorFunction function', function() {
            it('should set the table data to null', function() {
                expect(table.data).toBeNull();
                table.errorFunction();
                expect(table.data).toBeNull();
            });
        });

        describe('getData function', function() {
            var result;
            var val = 'data';
            var data = [{test: val}];

            it('should return the table data', function() {
                table.onDataReceived(data);
                result = table.getData();
                expect(result[0].test).toEqual(val);
            });

            it('should attempt to filter the data', function() {
                var filterVal = 'testFilter';
                spyOn(table, 'filterData').and.callThrough();
                table.filterValue = filterVal;
                table.onDataReceived(data);

                table.getData();

                expect(table.filterData).toHaveBeenCalled();
            });

            it('should not error if there is not a pagination object defined', function() {
                table.pagination = null;
                table.data = [];
                expect(function(){table.getData();}).not.toThrow();
            });
        });

        describe('getDataCount function', function() {
            it('should return the data count for the table', function() {
                var val = 'data';
                var val2 = 'data2';
                var data = [{test: val}];

                spyOn(table, 'sortData');
                table.onDataReceived(data);
                expect(table.getDataCount()).toEqual(1);

                data = [{test: val}, {test2: val2}];

                table.onDataReceived(data);
                expect(table.getDataCount()).toEqual(2);
            });
        });

        describe('getColDefinitions function', function() {
            it('should retrieve the column definitions for the table', function() {
                var testColDef = [{prop: 'val1'}, {prop: 'val2'}];

                table.cols = testColDef;

                expect(table.getColDefinitions()).toEqual(testColDef);
            });
        });

        describe('getSortColIndex function', function() {
            it('should retrieve the sort column index for the table', function() {
                var testSortColIdx = 99;

                table.sortColIndex = testSortColIdx;

                expect(table.getSortColIndex()).toEqual(testSortColIdx);
            });
        });

        describe('getRowClickData function', function() {
            it('should retrieve row click data for the table', function() {
                var rowClick = {
                    actionType: 'test',
                    callback: function() {}
                };

                table.rowClick = rowClick;

                expect(table.getRowClickData()).toEqual(rowClick);
            });
        });

        describe('getPaginationData function', function() {
            it('should retrieve pagination data for the table', function() {
                var pagination = {
                    cursor: 15,
                    size: 5
                };

                table.pagination = pagination;

                expect(table.getPaginationData()).toEqual(pagination);
            });
        });

        describe('getQuickFilterValue function', function() {
            it('should retrieve quick filter value for the table', function() {
                var filterValue = "quick filter value";

                table.filterValue = filterValue;

                expect(table.getQuickFilterValue()).toEqual(filterValue);
            });
        });

        describe('setFilterValue', function() {
            it('should set the filter value and reset pagination if it is in the definition and the cursor is not at 0', function() {
                var val = 'testFilterValue';
                var def = _.cloneDeep(definition);
                def.pagination.cursor = 4;
                table = new TableStore.Table(id, def, null);
                spyOn(table, 'resetPagination');

                table.setFilterValue(val);

                expect(table.filterValue).toEqual(val);
                expect(table.resetPagination).toHaveBeenCalled();
            });

            it('should set the filter value and not reset pagination if it is in the definition and the cursor is at 0', function() {
                var val = 'testFilterValue';
                var def = _.cloneDeep(definition);
                def.pagination.cursor = 0;
                table = new TableStore.Table(id, def, null);
                spyOn(table, 'resetPagination');

                table.setFilterValue(val);

                expect(table.filterValue).toEqual(val);
                expect(table.resetPagination).not.toHaveBeenCalled();
            });

            it('should set the filter value and not reset pagination if it is not in the definition', function() {
                var val = 'testFilterValue';
                var def = _.cloneDeep(definition);
                def.pagination = null;
                table = new TableStore.Table(id, def, null);
                spyOn(table, 'resetPagination');

                table.setFilterValue(val);

                expect(table.filterValue).toEqual(val);
                expect(table.resetPagination).not.toHaveBeenCalled();
            });
        });

        describe('setAdvancedFilters', function() {
            it('should set the advancedFilters and reset pagination if it is in the definition and the cursor is not at 0', function() {
                var filters = {test: 'FilterValue'};
                var def = _.cloneDeep(definition);
                def.pagination.cursor = 4;
                table = new TableStore.Table(id, def, null);
                spyOn(table, 'resetPagination');

                table.setAdvancedFilters(filters);

                expect(table.advancedFilters).toEqual(filters);
                expect(table.resetPagination).toHaveBeenCalled();
            });

            it('should set the filter value and not reset pagination if it is in the definition and the cursor is at 0', function() {
                var filters = {test: 'FilterValue'};
                var def = _.cloneDeep(definition);
                def.pagination.cursor = 0;
                table = new TableStore.Table(id, def, null);
                spyOn(table, 'resetPagination');

                table.setAdvancedFilters(filters);

                expect(table.advancedFilters).toEqual(filters);
                expect(table.resetPagination).not.toHaveBeenCalled();
            });

            it('should set the filter value and not reset pagination if it is not in the definition', function() {
                var filters = {test: 'FilterValue'};
                var def = _.cloneDeep(definition);
                def.pagination = null;
                table = new TableStore.Table(id, def, null);
                spyOn(table, 'resetPagination');

                table.setAdvancedFilters(filters);

                expect(table.advancedFilters).toEqual(filters);
                expect(table.resetPagination).not.toHaveBeenCalled();
            });
        });

        describe('filterData function', function() {
            it('should trigger quick filtering', function() {
                var data = [{test: 'data1'}, {test: 'data2'}];
                spyOn(table, 'quickFilterData').and.returnValue(data);

                table.filterData(data);
                expect(table.quickFilterData).not.toHaveBeenCalled();

                table.filterValue = 'asdf';
                table.filterData(data);
                expect(table.quickFilterData).toHaveBeenCalled();
            });

            it('should trigger advanced filtering', function() {
                var data = [{test: 'data1'}, {test: 'data2'}];
                spyOn(table, 'advancedFilterData').and.returnValue(data);

                table.filterData(data);
                expect(table.advancedFilterData).not.toHaveBeenCalled();

                table.advancedFilters = [{test1: 'filter1'}, {test2: 'filter1'}];
                table.filterData(data);
                expect(table.advancedFilterData).toHaveBeenCalled();
            });
        });

        describe('quickFilterData', function() {
            var origDefinition = _.cloneDeep(definition);

            beforeEach(function() {
                definition.cols[0].quickFilter = true;
                definition.cols[1].quickFilter = true;

                table.onDataReceived(definition.data);
                expect(table.data.length).toEqual(7);
            });

            it('should filter data for each column that has quickFilter set to true and set the dataCount', function() {
                expect(table.quickFilterData(definition.data, 'a').length).toEqual(6);
            });

            it('should filter data for each column that has quickFilter set to true and set the dataCount', function() {
                expect(table.quickFilterData(definition.data, 14).length).toEqual(2);
            });

            // Reset definition
            definition = origDefinition;
        });

        describe('advancedFilterData', function() {
            it('should filter out table data where any property value equals a matching property value on an ' +
                'advanced filter unless the advanced filter has been checked.', function() {
                var data = [{test1: 'data1', test2: 'data1', test3: 'data1'}, {test1: 'data2', test2: 'data2'}, {test1: 'data3', test2: 'data3'}];
                var filters = [
                    {
                        dataProperty: 'test1',
                        filterValue: 'data1',
                        label: 'show test1 data1',
                        checked: true
                    }, // show the row
                    {
                        dataProperty: 'test2',
                        filterValue: 'data1',
                        label: 'show test2 data1',
                        checked: true
                    }, // allow a second filter to show the row
                    {
                        dataProperty: 'test3',
                        filterValue: 'data1',
                        label: 'show test3 data1'
                    }, // do not hide a row that has been shown by another filter
                    {
                        dataProperty: 'test1',
                        filterValue: 'data3',
                        label: 'show data4'
                    }  // hide a row where the filter is not checked
                ];
                expect(table.advancedFilterData(data, filters)).toEqual([
                    {test1: 'data1', test2: 'data1', test3: 'data1', shownByAdvancedFilters: ['test1', 'test2']},
                    {test1: 'data2', test2: 'data2'}
                ]);
            });
        });

        describe('paginate function', function() {
            it('should paginate to the right', function() {
                var direction = 'right';
                table.pagination = {
                    cursor: 0,
                    size: 5
                };
                table.paginate(direction);

                expect(table.getPaginationData().cursor).toEqual(5);
            });

            it('should paginate to the left', function() {
                var direction = 'left';
                table.pagination = {
                    cursor: 10,
                    size: 5
                };
                table.paginate(direction);

                expect(table.getPaginationData().cursor).toEqual(5);
            });
        });

        describe('resetPagination function', function() {
            it('should set the pagination cursor to 0', function() {
                table.pagination = {
                    cursor: 10,
                    size: 5
                };
                table.resetPagination();
                expect(table.getPaginationData().cursor).toEqual(0);
            });
        });

        describe('sliceData function', function() {
            it('should', function() {
                var data = [0, 1, 2, 3, 4, 5];

                table.pagination = {
                    cursor: 2,
                    size: 2
                };

                data = table.sliceData(data);

                expect(data.length).toEqual(2);
                expect(data[0]).toEqual(2);
            });
        });

        describe('sortData function', function() {
            beforeEach(function() {
                table.sortColIndex = 0;
                table.cols = [
                    {
                        dataProperty: 'string',
                        dataType: 'string',
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
                        sortDirection: 'descending'
                    },
                    {
                        dataProperty: 'percent',
                        dataType: 'percent',
                        sortDirection: 'descending'
                    },
                    {
                        dataProperty: 'duration',
                        dataType: 'duration',
                        sortDirection: 'descending'
                    }
                ];
                table.data = [
                    {string: 'aaa', integer: -2, mixedCase: 'Aaa', time: 1417455952, percent: 0, duration: 0},
                    {string: 'b', integer: 3, mixedCase: 'B', percent: 83, duration: 83},
                    {string: 'a', integer: 0, mixedCase: 'a', time: 1416591981, percent: 70, duration: 70},
                    {string: 'aa', integer: 2, mixedCase: 'Aa', time: 1417715098, percent: 82, duration: 82},
                    {},
                    {string: 'aab', integer: -1, mixedCase: 'aAb', percent: 8, duration: 8},
                    {string: 'ab', integer: 1, mixedCase: 'aB', percent: 80, duration: 80},
                    {string: null, integer: null, mixedCase: null, time: null, percent: null, duration: null},
                    {string: 'aba', integer: 1, mixedCase: 'aBA', time: 1406479597, percent: 80, duration: 80}
                ];
                table.onDataReceived(table.data);
            });

            afterEach(function() {
                table.data = [];
            });

            it('should change the sort direction for the column index', function() {
                expect(table.cols[0].sortDirection).toEqual('ascending');
                table.sortData(0, 'descending');
                expect(table.cols[0].sortDirection).toEqual('descending');
            });

            it('should reset pagination when sorting if pagination exists', function() {
                table.pagination = {
                    cursor: 2,
                    size: 2
                };
                expect(table.getPaginationData().cursor).toEqual(2);
                table.sortData(0, 'descending');
                expect(table.getPaginationData().cursor).toEqual(0);
            });

            it('should not reset pagination when sorting if pagination does not exists', function() {
                delete table.pagination;
                expect(table.getPaginationData()).toBeUndefined();
                table.sortData(0, 'descending');
                expect(table.getPaginationData()).toBeUndefined();
            });

            it('should sort objects on a key of type integer in ascending order', function() {
                table.sortData(1, 'ascending');
                // null values will be first because sorting to opposite of default sort order
                expect(table.data[0].integer).toBeUndefined();
                expect(table.data[1].integer).toBeNull();
                expect(table.data[2].integer).toEqual(-2);
                expect(table.data[3].integer).toEqual(-1);
                expect(table.data[4].integer).toEqual(0);
                expect(table.data[5].integer).toEqual(1);
                expect(table.data[6].integer).toEqual(1);
                expect(table.data[7].integer).toEqual(2);
                expect(table.data[8].integer).toEqual(3);
            });

            it('should sort objects on a key of type integer in descending order', function() {
                table.sortData(1, 'descending');
                // null values will be last because sorting to same as default sort order
                expect(table.data[0].integer).toEqual(3);
                expect(table.data[1].integer).toEqual(2);
                expect(table.data[2].integer).toEqual(1);
                expect(table.data[3].integer).toEqual(1);
                expect(table.data[4].integer).toEqual(0);
                expect(table.data[5].integer).toEqual(-1);
                expect(table.data[6].integer).toEqual(-2);
                expect(table.data[7].integer).toBeUndefined();
                expect(table.data[8].integer).toBeNull();
            });

            it('should sort objects on a key of type strings in ascending order', function() {
                table.sortData(0, 'ascending');
                // null values will be last because sorting to same as default sort order
                expect(table.data[0].string).toEqual('a');
                expect(table.data[1].string).toEqual('aa');
                expect(table.data[2].string).toEqual('aaa');
                expect(table.data[3].string).toEqual('aab');
                expect(table.data[4].string).toEqual('ab');
                expect(table.data[5].string).toEqual('aba');
                expect(table.data[6].string).toEqual('b');
                expect(table.data[7].string).toBeUndefined();
                expect(table.data[8].string).toBeNull();
            });

            it('should sort objects on a key of type strings in descending order', function() {
                table.sortData(0, 'descending');
                // null values will be first because sorting to opposite of default sort order
                expect(table.data[0].string).toBeUndefined();
                expect(table.data[1].string).toBeNull();
                expect(table.data[2].string).toEqual('b');
                expect(table.data[3].string).toEqual('aba');
                expect(table.data[4].string).toEqual('ab');
                expect(table.data[5].string).toEqual('aab');
                expect(table.data[6].string).toEqual('aaa');
                expect(table.data[7].string).toEqual('aa');
                expect(table.data[8].string).toEqual('a');
            });

            it('should sort objects on a key with mixed case strings in a case insensitive manner and in ascending order', function() {
                table.sortData(2, 'ascending');
                // null values will be last because sorting to same as default sort order
                expect(table.data[0].mixedCase).toEqual('a');
                expect(table.data[1].mixedCase).toEqual('Aa');
                expect(table.data[2].mixedCase).toEqual('Aaa');
                expect(table.data[3].mixedCase).toEqual('aAb');
                expect(table.data[4].mixedCase).toEqual('aB');
                expect(table.data[5].mixedCase).toEqual('aBA');
                expect(table.data[6].mixedCase).toEqual('B');
                expect(table.data[7].string).toBeUndefined();
                expect(table.data[8].string).toBeNull();
            });

            it('should sort objects on a key with mixed case strings in a case insensitive manner and in descending order', function() {
                table.sortData(2, 'descending');
                // null values will be first because sorting to opposite of default sort order
                expect(table.data[0].string).toBeUndefined();
                expect(table.data[1].string).toBeNull();
                expect(table.data[2].mixedCase).toEqual('B');
                expect(table.data[3].mixedCase).toEqual('aBA');
                expect(table.data[4].mixedCase).toEqual('aB');
                expect(table.data[5].mixedCase).toEqual('aAb');
                expect(table.data[6].mixedCase).toEqual('Aaa');
                expect(table.data[7].mixedCase).toEqual('Aa');
                expect(table.data[8].mixedCase).toEqual('a');
            });

            it('should sort objects on a key of type timestamps in ascending order', function() {
                table.sortData(3, 'ascending');
                // null values will be first because sorting to opposite of default sort order
                expect(table.data[0].timeTimestamp).toBeNull();
                expect(table.data[1].timeTimestamp).toBeNull();
                expect(table.data[2].timeTimestamp).toBeNull();
                expect(table.data[3].timeTimestamp).toBeNull();
                expect(table.data[4].timeTimestamp).toBeNull();
                expect(table.data[5].timeTimestamp).toEqual(1406479597);
                expect(table.data[6].timeTimestamp).toEqual(1416591981);
                expect(table.data[7].timeTimestamp).toEqual(1417455952);
                expect(table.data[8].timeTimestamp).toEqual(1417715098);
            });

            it('should sort objects on a key of type timestamps in descending order', function() {
                table.sortData(3, 'descending');
                // null values will be last because sorting to same as default sort order
                expect(table.data[0].timeTimestamp).toEqual(1417715098);
                expect(table.data[1].timeTimestamp).toEqual(1417455952);
                expect(table.data[2].timeTimestamp).toEqual(1416591981);
                expect(table.data[3].timeTimestamp).toEqual(1406479597);
                expect(table.data[4].timeTimestamp).toBeNull();
                expect(table.data[5].timeTimestamp).toBeNull();
                expect(table.data[6].timeTimestamp).toBeNull();
                expect(table.data[7].timeTimestamp).toBeNull();
                expect(table.data[8].timeTimestamp).toBeNull();
            });

            it('should sort objects on a key of type percent in ascending order', function() {
                table.sortData(4, 'ascending');
                expect(table.data[0].percentPercent).toEqual(0);
                expect(table.data[1].percentPercent).toEqual(0);
                expect(table.data[2].percentPercent).toEqual(0);
                expect(table.data[3].percentPercent).toEqual(8);
                expect(table.data[4].percentPercent).toEqual(70);
                expect(table.data[5].percentPercent).toEqual(80);
                expect(table.data[6].percentPercent).toEqual(80);
                expect(table.data[7].percentPercent).toEqual(82);
                expect(table.data[8].percentPercent).toEqual(83);
            });

            it('should sort objects on a key of type percent in descending order', function() {
                table.sortData(4, 'descending');
                expect(table.data[0].percentPercent).toEqual(83);
                expect(table.data[1].percentPercent).toEqual(82);
                expect(table.data[2].percentPercent).toEqual(80);
                expect(table.data[3].percentPercent).toEqual(80);
                expect(table.data[4].percentPercent).toEqual(70);
                expect(table.data[5].percentPercent).toEqual(8);
                expect(table.data[6].percentPercent).toEqual(0);
                expect(table.data[7].percentPercent).toEqual(0);
                expect(table.data[8].percentPercent).toEqual(0);
            });

            it('should sort objects on a key of type duration in ascending order', function() {
                table.sortData(5, 'ascending');
                expect(table.data[0].durationDuration).toEqual(0);
                expect(table.data[1].durationDuration).toEqual(0);
                expect(table.data[2].durationDuration).toEqual(0);
                expect(table.data[3].durationDuration).toEqual(8);
                expect(table.data[4].durationDuration).toEqual(70);
                expect(table.data[5].durationDuration).toEqual(80);
                expect(table.data[6].durationDuration).toEqual(80);
                expect(table.data[7].durationDuration).toEqual(82);
                expect(table.data[8].durationDuration).toEqual(83);
            });

            it('should sort objects on a key of type duration in descending order', function() {
                table.sortData(5, 'descending');
                expect(table.data[0].durationDuration).toEqual(83);
                expect(table.data[1].durationDuration).toEqual(82);
                expect(table.data[2].durationDuration).toEqual(80);
                expect(table.data[3].durationDuration).toEqual(80);
                expect(table.data[4].durationDuration).toEqual(70);
                expect(table.data[5].durationDuration).toEqual(8);
                expect(table.data[6].durationDuration).toEqual(0);
                expect(table.data[7].durationDuration).toEqual(0);
                expect(table.data[8].durationDuration).toEqual(0);
            });
        });

        describe('getSelectedItems', function() {
            it ('should return the selected items for the table instance', function() {
                var selectedItems = {'item1': true, 'item2': true};
                var table = new TableStore.Table(id, definition, null);
                table.selectedItems = selectedItems;

                expect(table.getSelectedItems()).toEqual(selectedItems);
            });
        });

        describe('getFilteredData', function() {
            it ('should return the filtered data for the table instance', function() {
                var filteredData = {'item1': true, 'item2': true};
                var table = new TableStore.Table(id, definition, null);
                table.filteredData = filteredData;

                expect(table.getFilteredData()).toEqual(filteredData);
            });
        });

        describe('updateBulkSelection', function() {
            it ('should add or remove all filtered data elements to/from the selected items object', function() {
                var filteredData = [{'item': 'test1'}, {'item': 'test2'}];
                var table = new TableStore.Table(id, definition, null);
                table.filteredData = filteredData;
                table.selectDataProperty = 'item';

                table.updateBulkSelection(false);

                expect(table.selectedItems).toEqual({'test1': {item: 'test1'}, 'test2': {item: 'test2'}});

                table.updateBulkSelection(true);
                expect(table.selectedItems).toEqual({});
            });
        });

        describe('updateRowSelection', function() {
            it ('should add or remove a single filtered data element to/from the selected items object', function() {
                var displayedData = [{'item': 'test1'}, {'item': 'test2'}];
                var table = new TableStore.Table(id, definition, null);
                table.displayedData = displayedData;
                table.selectDataProperty = 'item';

                table.updateRowSelection(0);

                expect(table.selectedItems).toEqual({'test1': {item: 'test1'}});

                table.updateRowSelection(0);
                expect(table.selectedItems).toEqual({});
            });
        });
    });

    describe('createInstance function', function() {
        it('should create an instance of the Table class', function() {
            var instance = TableStore.createInstance('foo', {test: 'definition'});
            expect(instance).toBeObject();
            expect(TableStore.collection.foo).toEqual(instance);

            delete TableStore.collection.foo;
        });
    });

    describe('destroyInstance function', function() {
        it('should destroy an instance of the Table class', function() {
            TableStore.destroyInstance(id);
            expect(TableStore.collection[id]).toBeFalsy();
        });
    });

    describe('getInstance function', function() {
        it('should return the table instance', function() {
            expect(TableStore.getInstance(id).id).toEqual(id);
        });
    });

    describe('getSelectedItems function', function() {
        it('should return an array of selected row keys', function() {
            var table = new TableStore.Table(id, definition, null);
            table.selectedItems = {'item1': true, 'item2': true};
            TableStore.collection[id] = table;

            expect(TableStore.getSelectedItems(id)).toEqual(['item1', 'item2']);

            // Reset collection;
            TableStore.collection = {};
        });
    });

    describe('dispatchRegister function', function() {
        it('should not handle the action if the component type is not supported', function() {
            var payload = {
                action: {
                    actionType: ActionTypes.REQUEST_DATA
                }
            };
            spyOn(TableStore, 'handleRequestDataAction');
            TableStore.dispatchRegister(payload);

            expect(TableStore.handleRequestDataAction).not.toHaveBeenCalled();
        });

        it('should handle the action if the component type is supported, but not emit a change if the action is not defined', function() {
            var payload = {
                action: {
                    actionType: 'thisActionIsNotSupported',
                    component: 'Table'
                }
            };
            spyOn(TableStore, 'emitChange');
            TableStore.dispatchRegister(payload);

            expect(TableStore.emitChange).not.toHaveBeenCalled();
        });

        it('should call the handleRequestDataAction function when the action is requesting data', function() {
            var payload = {
                action: {
                    actionType: ActionTypes.REQUEST_DATA,
                    component: 'Table'
                }
            };

            spyOn(TableStore, 'handleRequestDataAction');
            TableStore.dispatchRegister(payload);

            expect(TableStore.handleRequestDataAction).toHaveBeenCalledWith(payload.action);
        });

        it('should call the sortData function and emit a change when the action is requesting that the table is sorted', function() {
            var payload = {
                action: {
                    actionType: ActionTypes.TABLE_SORT,
                    component: 'Table',
                    id: 'testId',
                    data: {
                        colIndex: 0,
                        direction: 'descending'
                    }
                }
            };
            TableStore.collection['testId'] = {sortData: function(){}};

            spyOn(TableStore.collection['testId'], 'sortData');
            spyOn(TableStore, 'emitChange');
            TableStore.dispatchRegister(payload);

            expect(TableStore.collection['testId'].sortData).toHaveBeenCalledWith(payload.action.data.colIndex, payload.action.data.direction);
            expect(TableStore.emitChange).toHaveBeenCalledWith(payload.action.id);
        });

        it('should call the filter function and emit a change when the action is requesting that the table be filtered', function() {
            var payload = {
                action: {
                    actionType: ActionTypes.FILTER,
                    component: 'Table',
                    id: 'testId',
                    data: {
                        value: 'testValue'
                    }
                }
            };
            TableStore.collection['testId'] = {setFilterValue: function(){}};

            spyOn(TableStore.collection['testId'], 'setFilterValue');
            spyOn(TableStore, 'emitChange');
            TableStore.dispatchRegister(payload);

            expect(TableStore.collection['testId'].setFilterValue).toHaveBeenCalledWith(payload.action.data.value);
            expect(TableStore.emitChange).toHaveBeenCalledWith(payload.action.id);
        });

        it('should call the filter function and emit a change when the action is requesting that the table be filtered', function() {
            var payload = {
                action: {
                    actionType: ActionTypes.ADVANCED_FILTER,
                    component: 'Table',
                    id: 'testId',
                    data: {
                        advancedFilters: [{test: 'filter'}]
                    }
                }
            };
            TableStore.collection['testId'] = {setAdvancedFilters: function(){}};

            spyOn(TableStore.collection['testId'], 'setAdvancedFilters');
            spyOn(TableStore, 'emitChange');
            TableStore.dispatchRegister(payload);

            expect(TableStore.collection['testId'].setAdvancedFilters).toHaveBeenCalledWith(payload.action.data.advancedFilters);
            expect(TableStore.emitChange).toHaveBeenCalledWith(payload.action.id);
        });

        it('should call the paginate function and emit a change when the action is requesting that the table be paginated', function() {
            var payload = {
                action: {
                    actionType: ActionTypes.PAGINATE,
                    component: 'Table',
                    id: 'testId',
                    data: {
                        direction: 'right'
                    }
                }
            };
            TableStore.collection['testId'] = {paginate: function(){}};

            spyOn(TableStore.collection['testId'], 'paginate');
            spyOn(TableStore, 'emitChange');
            TableStore.dispatchRegister(payload);

            expect(TableStore.collection['testId'].paginate).toHaveBeenCalledWith(payload.action.data.direction);
            expect(TableStore.emitChange).toHaveBeenCalledWith(payload.action.id);
        });

        it('should call the update bulk selection function and emit a change when the action is requesting bulk selection', function() {
            var payload = {
                action: {
                    actionType: ActionTypes.TOGGLE_BULK_SELECT,
                    component: 'Table',
                    id: 'testId',
                    data: {
                        deselect: false
                    }
                }
            };
            TableStore.collection['testId'] = {updateBulkSelection: function(){}};

            spyOn(TableStore.collection['testId'], 'updateBulkSelection');
            spyOn(TableStore, 'emitChange');
            TableStore.dispatchRegister(payload);

            expect(TableStore.collection['testId'].updateBulkSelection).toHaveBeenCalledWith(payload.action.data.deselect);
            expect(TableStore.emitChange).toHaveBeenCalledWith(payload.action.id);
        });

        it('should call the update row selection function and emit a change when the action is requesting row selection', function() {
            var payload = {
                action: {
                    actionType: ActionTypes.TOGGLE_ROW_SELECT,
                    component: 'Table',
                    id: 'testId',
                    data: {
                        rowIndex: 0
                    }
                }
            };
            TableStore.collection['testId'] = {updateRowSelection: function(){}};

            spyOn(TableStore.collection['testId'], 'updateRowSelection');
            spyOn(TableStore, 'emitChange');
            TableStore.dispatchRegister(payload);

            expect(TableStore.collection['testId'].updateRowSelection).toHaveBeenCalledWith(payload.action.data.rowIndex);
            expect(TableStore.emitChange).toHaveBeenCalledWith(payload.action.id);
        });

        it('should call the destroyInstance function when the action is requesting that the table be destroyed', function() {
            var payload = {
                action: {
                    actionType: ActionTypes.DESTROY_INSTANCE,
                    component: 'Table',
                    id: 'testId'
                }
            };

            spyOn(TableStore, 'destroyInstance');
            TableStore.dispatchRegister(payload);

            expect(TableStore.destroyInstance).toHaveBeenCalledWith(payload.action.id);
        });
    });
});
