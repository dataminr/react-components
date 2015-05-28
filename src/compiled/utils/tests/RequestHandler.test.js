define(function(require) {
    var RequestHandler = require('../RequestHandler.js');

    var TestResponses = {
        test: {
            success: {
                status: 200,
                responseText: '{"response":{}}'
            },
            fail: {
                status: 200,
                responseText: '{"response":{}'
            }
        }
    };

    describe('RequestHandler', function() {
        var request, onSuccess, onFailure;

        beforeEach(function() {
            jasmine.Ajax.install();

            onSuccess = jasmine.createSpy('onSuccess');
            onFailure = jasmine.createSpy('onFailure');

            RequestHandler.request('test', {}, onSuccess, onFailure, this);

            request = jasmine.Ajax.requests.mostRecent();

            expect(request.url).toBe('test');
            expect(request.method).toBe('GET');
            expect(request.data()).toEqual({});
        });

        it('should call onSuccess when a proper response has been received.', function() {
            request.respondWith(TestResponses.test.success);
            expect(onSuccess).toHaveBeenCalled();
        });

        it('should call onFailure when a proper response was not received', function() {
            request.respondWith(TestResponses.test.fail);
            expect(onFailure).toHaveBeenCalled();
        });

        it('should call function without passing in scope.', function() {
            RequestHandler.request('test', {}, onSuccess, onFailure);

            request = jasmine.Ajax.requests.mostRecent();

            request.respondWith(TestResponses.test.success);
            expect(onSuccess).toHaveBeenCalled();
        });
    });
});
