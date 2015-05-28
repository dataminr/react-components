define(function(require) {
    var AppDispatcher = require('drc/dispatcher/AppDispatcher');

    describe('AppDispatcher', function() {
        var testAction;

        beforeEach(function() {
            testAction = {
                data: 'test'
            };

            spyOn(AppDispatcher, 'dispatch');
        });

        it('should properly dispatch a view action', function() {
            AppDispatcher.dispatchAction(testAction);

            expect(AppDispatcher.dispatch).toHaveBeenCalledWith({
                action: testAction
            });
        });
    });
});
