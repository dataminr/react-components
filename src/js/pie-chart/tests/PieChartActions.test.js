var AppDispatcher = require('../../dispatcher/AppDispatcher');
var PieChartActions = require('../PieChartActions');

describe('PieChartActions', function() {
    describe('requestData function', function() {
        it('should request that an action be dispatched', function() {
            var id = 'testID';
            var definition = 'testDefinition';
            var filters = {test: 'filter'};

            spyOn(AppDispatcher, 'dispatchAction');

            PieChartActions.requestData(id, definition, filters);

            expect(AppDispatcher.dispatchAction).toHaveBeenCalledWith({
                actionType: PieChartActions.actionTypes.REQUEST_DATA,
                component: 'PieChart',
                id: id,
                data: {
                    definition: definition,
                    filters: filters
                }
            });
        });
    });

    describe('destroyInstance function', function() {
        it('should request that an action be dispatched', function() {
            var id = 'testID';

            spyOn(AppDispatcher, 'dispatchAction');

            PieChartActions.destroyInstance(id);

            expect(AppDispatcher.dispatchAction).toHaveBeenCalledWith({
                actionType: PieChartActions.actionTypes.DESTROY_INSTANCE,
                component: 'PieChart',
                id: id
            });
        });
    });
});
