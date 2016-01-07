var StoreBase = require('../StoreBase');
var RequestHandler = require('RequestHandler');

describe('StoreBase', function() {
    StoreBase.collection = {};

    describe('requestData function', function() {
        it('should create an instance of the Record class', function() {
            var dataReceivedSpy = jasmine.createSpy(),
                errorFunctionSpy = jasmine.createSpy(),
                callbackSpy = jasmine.createSpy();

            StoreBase.collection.test = {
                url: 'requestUrl',
                onDataReceived: dataReceivedSpy,
                errorFunction: errorFunctionSpy
            };

            spyOn(RequestHandler, 'request');

            StoreBase.requestData('test', {foo: 'bar'}, callbackSpy);

            expect(RequestHandler.request).toHaveBeenCalled();
            expect(RequestHandler.request.calls.first().args[0]).toEqual('requestUrl');
            expect(RequestHandler.request.calls.first().args[1]).toEqual({foo: 'bar'});

            var onSuccessMethod = RequestHandler.request.calls.first().args[2],
                onErrorMethod = RequestHandler.request.calls.first().args[3];

            expect(onSuccessMethod).toBeFunction();
            expect(onErrorMethod).toBeFunction();

            onSuccessMethod({data: 'requested'});
            expect(dataReceivedSpy.calls.count()).toEqual(1);
            expect(dataReceivedSpy).toHaveBeenCalledWith({data: 'requested'});
            expect(callbackSpy.calls.count()).toEqual(1);
            expect(callbackSpy).toHaveBeenCalledWith();

            callbackSpy.calls.reset();

            onErrorMethod();
            expect(errorFunctionSpy.calls.count()).toEqual(1);
            expect(errorFunctionSpy).toHaveBeenCalledWith();
            expect(callbackSpy.calls.count()).toEqual(1);
            expect(callbackSpy).toHaveBeenCalledWith(true);
        });
    });
});

describe('emitChange function', function(){
    it('does not emit namespaced change if no id provided', function(){
        spyOn(StoreBase, 'emit');

        StoreBase.emitChange();
        expect(StoreBase.emit.calls.count()).toEqual(1);
        expect(StoreBase.emit).toHaveBeenCalledWith('change');

        StoreBase.emit.calls.reset();

        StoreBase.emitChange(null);
        expect(StoreBase.emit.calls.count()).toEqual(1);
        expect(StoreBase.emit).toHaveBeenCalledWith('change');
    });

    it('calls namespaced change event when ID provided', function(){
        spyOn(StoreBase, 'emit');

        StoreBase.emitChange('foo');
        expect(StoreBase.emit.calls.count()).toEqual(2);
        expect(StoreBase.emit).toHaveBeenCalledWith('change');
        expect(StoreBase.emit).toHaveBeenCalledWith('change:foo');
    });

    it('should emit a change with additional params', function(){
        spyOn(StoreBase, 'emit');

        StoreBase.emitChange('foo', 'param1', 'param2');
        expect(StoreBase.emit.calls.count()).toEqual(2);
        expect(StoreBase.emit).toHaveBeenCalledWith('change', 'param1', 'param2');
        expect(StoreBase.emit).toHaveBeenCalledWith('change:foo', 'param1', 'param2');
    });
});

describe('emitFail function', function(){
    it('does not emit namespaced fail if no id provided', function(){
        spyOn(StoreBase, 'emit');

        StoreBase.emitFail();
        expect(StoreBase.emit.calls.count()).toEqual(1);
        expect(StoreBase.emit).toHaveBeenCalledWith('fail');

        StoreBase.emit.calls.reset();

        StoreBase.emitFail(null);
        expect(StoreBase.emit.calls.count()).toEqual(1);
        expect(StoreBase.emit).toHaveBeenCalledWith('fail');
    });

    it('calls namespaced change event when ID provided', function(){
        spyOn(StoreBase, 'emit');

        StoreBase.emitFail('foo');
        expect(StoreBase.emit.calls.count()).toEqual(2);
        expect(StoreBase.emit).toHaveBeenCalledWith('fail');
        expect(StoreBase.emit).toHaveBeenCalledWith('fail:foo');
    });

    it('should emit a change with additional params', function(){
        spyOn(StoreBase, 'emit');

        StoreBase.emitFail('foo', 'param1', 'param2');
        expect(StoreBase.emit.calls.count()).toEqual(2);
        expect(StoreBase.emit).toHaveBeenCalledWith('fail', 'param1', 'param2');
        expect(StoreBase.emit).toHaveBeenCalledWith('fail:foo', 'param1', 'param2');
    });
});

describe('shouldHandleAction function', function(){
    it('returns true if no component type', function(){
        expect(StoreBase.shouldHandleAction()).toBeTrue();
        expect(StoreBase.shouldHandleAction(null)).toBeTrue();
        expect(StoreBase.shouldHandleAction(false)).toBeTrue();
        expect(StoreBase.shouldHandleAction(1)).toBeTrue();
        expect(StoreBase.shouldHandleAction({})).toBeTrue();
        expect(StoreBase.shouldHandleAction([])).toBeTrue();
        expect(StoreBase.shouldHandleAction('foo')).toBeTrue();
    });

    it('checks type if passed a string', function(){
        StoreBase.componentType = "foo";
        expect(StoreBase.shouldHandleAction('FOO')).toBeFalse();
        expect(StoreBase.shouldHandleAction('Foo')).toBeFalse();
        expect(StoreBase.shouldHandleAction('foo')).toBeTrue();

        StoreBase.componentType = undefined;
    });

    it('checks list of types if pass an array', function(){
        StoreBase.componentType = [];

        expect(StoreBase.shouldHandleAction('foo')).toBeFalse();
        expect(StoreBase.shouldHandleAction(1)).toBeFalse();
        expect(StoreBase.shouldHandleAction(null)).toBeFalse();

        StoreBase.componentType = ['foo'];

        expect(StoreBase.shouldHandleAction('FOO')).toBeFalse();
        expect(StoreBase.shouldHandleAction('Foo')).toBeFalse();
        expect(StoreBase.shouldHandleAction('foo')).toBeTrue();

        StoreBase.componentType = ['foo', 'bar'];

        expect(StoreBase.shouldHandleAction('foo')).toBeTrue();
        expect(StoreBase.shouldHandleAction('bar')).toBeTrue();

        StoreBase.componentType = undefined;
    });
});

describe('handleRequestDataAction function', function(){
    it('bails if shouldHandleAction returns false', function(){
        var handleSpy = spyOn(StoreBase, 'shouldHandleAction').and.returnValue(false);

        var action = {
            id: 'foo',
            data: {
                modelType: 'bar'
            }
        };

        expect(StoreBase.handleRequestDataAction(action)).toBeUndefined();

        handleSpy.and.returnValue(null);
        expect(StoreBase.handleRequestDataAction(action)).toBeUndefined();
    });

    it('bails out if modelType is unsupported', function(){
        var handleSpy = spyOn(StoreBase, 'shouldHandleAction').and.returnValue(true);
        var createInstanceSpy = jasmine.createSpy();
        StoreBase.createInstance = createInstanceSpy;

        var action = {
            id: 'foo',
            data: {
                modelType: 'bar'
            }
        };
        StoreBase.modelTypes = {};

        StoreBase.handleRequestDataAction(action);
        expect(createInstanceSpy).not.toHaveBeenCalled();

        StoreBase.modelTypes = {BAR: 'foo'};
        StoreBase.handleRequestDataAction(action);
        expect(createInstanceSpy).not.toHaveBeenCalled();

        StoreBase.modelTypes = undefined;
    });

    it('calls create instance if not existent', function(){
        var handleSpy = spyOn(StoreBase, 'shouldHandleAction').and.returnValue(true);
        StoreBase.createInstance = function(){};
        var createInstanceSpy = spyOn(StoreBase, 'createInstance');

        StoreBase.modelTypes = {type: 'bar'};

        var action = {
            id: 'foo',
            data: {
                definition: 'type',
                dataFormatter: 'formatter'
            }
        };

        expect(StoreBase.handleRequestDataAction(action)).toBeUndefined();
        expect(createInstanceSpy).toHaveBeenCalledWith('foo', 'type', 'formatter');
    });

    it('calls request data if action type is correct', function(){
        var handleSpy = spyOn(StoreBase, 'shouldHandleAction').and.returnValue(true);
        StoreBase.createInstance = function(){};
        var createInstanceSpy = spyOn(StoreBase, 'createInstance').and.returnValue({});
        var requestDataSpy = spyOn(StoreBase, 'requestData');

        StoreBase.modelTypes = {foo: 'bar'};
        StoreBase.collection.foo = {};

        var action = {
            id: 'foo',
            data: {
                filters: {filter: 'value'}
            },
            actionType: 'REQUEST_DATA'
        };

        expect(StoreBase.handleRequestDataAction(action)).toBeUndefined();
        expect(createInstanceSpy.calls.count()).toEqual(0);
        expect(requestDataSpy).toHaveBeenCalled();
        var reqDataArgs = requestDataSpy.calls.allArgs()[0];
        expect(reqDataArgs[0]).toEqual('foo');
        expect(reqDataArgs[1]).toEqual({filter: 'value'});

        var handleResponse = reqDataArgs[2];
        expect(handleResponse).toBeFunction();

        var failSpy = spyOn(StoreBase, 'emitFail');
        var changeSpy = spyOn(StoreBase, 'emitChange');

        handleResponse('error message');
        expect(failSpy).toHaveBeenCalledWith('foo');
        expect(changeSpy.calls.count()).toEqual(0);
        failSpy.calls.reset();

        handleResponse(null);
        expect(changeSpy).toHaveBeenCalledWith('foo');
        expect(failSpy.calls.count()).toEqual(0);
        failSpy.calls.reset();
    });

    it('uses existing filters on instance if present', function(){
        spyOn(StoreBase, 'shouldHandleAction').and.returnValue(true);
        var requestDataSpy = spyOn(StoreBase, 'requestData');

        StoreBase.collection.foo = {
            requestFilters: {filter: 'value'}
        };

        var action = {
            id: 'foo',
            actionType: 'REQUEST_DATA'
        };

        expect(StoreBase.handleRequestDataAction(action)).toBeUndefined();
        expect(requestDataSpy).toHaveBeenCalled();
        var reqDataArgs = requestDataSpy.calls.allArgs()[0];
        expect(reqDataArgs[0]).toEqual('foo');
        expect(reqDataArgs[1]).toEqual({filter: 'value'});
    });

    it('calls create instance when one doesnt exist', function(){
        var handleSpy = spyOn(StoreBase, 'shouldHandleAction').and.returnValue(true);
        StoreBase.createInstance = function(){};
        var createInstanceSpy = spyOn(StoreBase, 'createInstance').and.returnValue({});
        var requestDataSpy = spyOn(StoreBase, 'requestData');

        StoreBase.collection = {};

        var action = {
            id: 'foo',
            data: {
                definition: 'def',
                dataFormatter: 'formatter',
                filters: {filter: 'value'}
            },
            actionType: 'REQUEST_DATA'
        };

        StoreBase.handleRequestDataAction(action);

        expect(createInstanceSpy).toHaveBeenCalledWith('foo', 'def', 'formatter');
    });

    it('bails when no instance and no definition provided', function(){
        var handleSpy = spyOn(StoreBase, 'shouldHandleAction').and.returnValue(true);
        var requestDataSpy = spyOn(StoreBase, 'requestData');

        StoreBase.collection = {};

        var action = {
            id: 'foo',
            data: {
                dataFormatter: 'formatter',
                filters: {filter: 'value'}
            },
            actionType: 'REQUEST_DATA'
        };

        StoreBase.handleRequestDataAction(action);

        expect(requestDataSpy).not.toHaveBeenCalled();
    });
});
