define(function(require) {
    var AppDispatcher = require('drc/dispatcher/AppDispatcher');
    var TableActions = require('drc/table/TableActions');

    var ActionTypes = TableActions.actionTypes;

    describe('TableActions', function() {
        describe('requestData', function() {
            it('should request that an action be dispatched', function() {
                var id = 'testID';
                var definition = {testModelType: 'testModelType'};
                var dataFormatter = 'formatter';
                var filters = {test: 'filter'};

                spyOn(AppDispatcher, 'dispatchAction');

                TableActions.requestData(id, definition, dataFormatter, filters);

                expect(AppDispatcher.dispatchAction).toHaveBeenCalledWith({
                    actionType: ActionTypes.REQUEST_DATA,
                    component: 'Table',
                    id: id,
                    data: {
                        definition: definition,
                        dataFormatter: dataFormatter,
                        filters: filters
                    }
                });
            });
        });

        describe('destroyInstance', function() {
            it('should request that an action be dispatched', function() {
                var id = 'testID';

                spyOn(AppDispatcher, 'dispatchAction');

                TableActions.destroyInstance(id);

                expect(AppDispatcher.dispatchAction).toHaveBeenCalledWith({
                    actionType: ActionTypes.DESTROY_INSTANCE,
                    component: 'Table',
                    id: id
                });
            });
        });

        describe('filter', function() {
            it('should request that an action be dispatched', function() {
                var id = 'testID';
                var value = 'testFilter';

                spyOn(AppDispatcher, 'dispatchAction');

                TableActions.filter(id, value);

                expect(AppDispatcher.dispatchAction).toHaveBeenCalledWith({
                    actionType: ActionTypes.FILTER,
                    component: 'Table',
                    id: id,
                    data: {
                        value: value
                    }
                });
            });
        });

        describe('advancedFilter', function() {
            it('should request that an action be dispatched', function() {
                var id = 'testID';
                var advancedFilters = [{test: 'filter'}];

                spyOn(AppDispatcher, 'dispatchAction');

                TableActions.advancedFilter(id, advancedFilters);

                expect(AppDispatcher.dispatchAction).toHaveBeenCalledWith({
                    actionType: ActionTypes.ADVANCED_FILTER,
                    component: 'Table',
                    id: id,
                    data: {
                        advancedFilters: advancedFilters
                    }
                });
            });
        });

        describe('paginate', function() {
            it('should request that an action be dispatched', function() {
                var id = 'testID';
                var direction = 'testDirection';

                spyOn(AppDispatcher, 'dispatchAction');

                TableActions.paginate(id, direction);

                expect(AppDispatcher.dispatchAction).toHaveBeenCalledWith({
                    actionType: ActionTypes.PAGINATE,
                    component: 'Table',
                    id: id,
                    data: {
                        direction: direction
                    }
                });
            });
        });

        describe('sortChange', function() {
            it('should request that an action be dispatched', function() {
                var id = 'testID';
                var colIndex = 0;
                var direction = 'testDirection';

                spyOn(AppDispatcher, 'dispatchAction');

                TableActions.sortChange(id, colIndex, direction);

                expect(AppDispatcher.dispatchAction).toHaveBeenCalledWith({
                    actionType: ActionTypes.TABLE_SORT,
                    component: 'Table',
                    id: id,
                    data: {
                        colIndex: colIndex,
                        direction: direction
                    }
                });
            });
        });

        describe('toggleBulkSelect', function() {
            it('should request that an action be dispatched', function() {
                var id = 'testID';
                var deselect = false;

                spyOn(AppDispatcher, 'dispatchAction');

                TableActions.toggleBulkSelect(id, deselect);

                expect(AppDispatcher.dispatchAction).toHaveBeenCalledWith({
                    actionType: ActionTypes.TOGGLE_BULK_SELECT,
                    component: 'Table',
                    id: id,
                    data: {
                        deselect: deselect
                    }
                });
            });
        });

        describe('toggleRowSelect', function() {
            it('should request that an action be dispatched', function() {
                var id = 'testID';
                var rowIndex = 0;

                spyOn(AppDispatcher, 'dispatchAction');

                TableActions.toggleRowSelect(id, rowIndex);

                expect(AppDispatcher.dispatchAction).toHaveBeenCalledWith({
                    actionType: ActionTypes.TOGGLE_ROW_SELECT,
                    component: 'Table',
                    id: id,
                    data: {
                        rowIndex: rowIndex
                    }
                });
            });
        });
    });
});
