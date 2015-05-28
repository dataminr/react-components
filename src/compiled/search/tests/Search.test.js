define(function(require) {
    var React = require('react');
    var Search = require('drc/search/Search');
    var RequestHandler = require('RequestHandler');

    var TestUtils = React.addons.TestUtils;

    describe('Search', function() {
        var search;
        var searchSubmitCallback;
        var onDataReceivedCallback;
        var onInputSubmitCallback;

        beforeEach(function() {
            searchSubmitCallback = jasmine.createSpy();
            onDataReceivedCallback = jasmine.createSpy().and.returnValue([{foo: 'bar'}]);
            onInputSubmitCallback = jasmine.createSpy();
            search = TestUtils.renderIntoDocument(
                React.createElement(Search, {onSelect: searchSubmitCallback, 
                        onDataReceived: onDataReceivedCallback, 
                        url: "/test/url", 
                        isFullDataResponse: true, 
                        searchFilterName: "myTerm", 
                        onInputSubmit: onInputSubmitCallback})
                );
        });

        describe('getInitialState function', function() {
            it('should initialize the state of the component', function() {
                expect(search.getInitialState()).toEqual({
                    disabled: true,
                    itemList: [],
                    shownList: [],
                    inputValue: '',
                    inputFocused: false
                });
            });
        });

        describe('componentDidMount function', function(){
            it('subscribes to store and requests data', function(){
                spyOn(search, 'requestFullData');

                search.componentDidMount();

                expect(search.requestFullData.calls.count()).toEqual(1);

                search.props.isFullDataResponse = false;

                search.componentDidMount();

                expect(search.requestFullData.calls.count()).toEqual(1);
            });
        });

        describe('requestFullData function', function(){
            it('pass props to request handler', function(){
                spyOn(RequestHandler, 'request');

                search.requestFullData();

                expect(RequestHandler.request.calls.argsFor(0)[0]).toEqual('/test/url');
                expect(RequestHandler.request.calls.argsFor(0)[1]).toBeUndefined();
                expect(RequestHandler.request.calls.argsFor(0)[2]).toBeFunction();
                expect(RequestHandler.request.calls.argsFor(0)[3]).toBeFunction();
                expect(RequestHandler.request.calls.argsFor(0)[3]).toBeObject();
            });
        });

        describe('requestDataForTerm function', function(){
            it('checks cache and returns if present', function(){
                search.cache.foo = {bar: 'baz'};
                spyOn(search, 'updateStateForNewData');

                search.requestDataForTerm('foo');

                expect(search.updateStateForNewData.calls.count()).toEqual(1);
                expect(search.updateStateForNewData.calls.argsFor(0)[0]).toEqual({bar: 'baz'});

                search.requestDataForTerm('FOO');

                expect(search.updateStateForNewData.calls.count()).toEqual(2);
                expect(search.updateStateForNewData.calls.argsFor(1)[0]).toEqual({bar: 'baz'});

                search.requestDataForTerm('FoO');

                expect(search.updateStateForNewData.calls.count()).toEqual(3);
                expect(search.updateStateForNewData.calls.argsFor(2)[0]).toEqual({bar: 'baz'});
            });

            it('calls abort on existing request if present', function(){
                spyOn(RequestHandler, 'request').and.returnValue("foo");

                search.outstandingRequest = {abort: jasmine.createSpy()};
                search.requestDataForTerm('my term');

                expect(search.outstandingRequest).toEqual("foo");
            });

            it('aborts existing request if present and makes new request', function(){
                spyOn(RequestHandler, 'request');

                search.requestDataForTerm('my term');

                expect(RequestHandler.request).toHaveBeenCalled();
                expect(RequestHandler.request.calls.argsFor(0)[0]).toEqual('/test/url');
                expect(RequestHandler.request.calls.argsFor(0)[1]).toEqual({myTerm: 'my term'});

                RequestHandler.request.calls.reset();
            });
        });

        describe('onError function', function(){
            it('calls setState if props are correct', function(){
                spyOn(search, 'setState');
                search.props.isFullDataResponse = true;
                search.onError();

                expect(search.setState).toHaveBeenCalledWith({placeholder: 'Unable to load list', disabled: true});

                search.props.isFullDataResponse = false;
                search.onError();
                expect(search.setState.calls.count()).toEqual(1);
            });
        });

        describe('onDataReceived function', function(){
            it('calls onError if no data is available', function(){
                spyOn(search, 'onError');
                spyOn(search, 'setState');

                search.onDataReceived(null);

                expect(search.onError).toHaveBeenCalledWith();
                expect(search.setState.calls.count()).toEqual(0);
            });

            it('calls custom on data recieved handler', function(){
                search.state.inputValue = "custom";
                spyOn(search, 'updateStateForNewData');
                spyOn(search, 'setState');
                search.onDataReceived([{foo: 'bar'}]);

                expect(onDataReceivedCallback).toHaveBeenCalledWith([{foo: 'bar'}], 'custom');
                expect(search.cache.custom).toEqual([{foo: 'bar'}]);
                expect(search.setState).toHaveBeenCalledWith({shownList: [{foo: 'bar'}]});
                expect(search.updateStateForNewData).toHaveBeenCalledWith([{foo: 'bar'}]);

                search.props.onDataReceived = null;
                search.onDataReceived([{foo: 'bar'}]);
                expect(search.setState.calls.count()).toEqual(1);
            });

            it('sorts data on response', function(){
                search.props.isFullDataResponse = false;
                search.props.onDataReceived = false;
                search.sortMatchingEntries = "fake";
                spyOn(search, 'setState');
                var request = {
                    length: 1,
                    sort: jasmine.createSpy()
                };

                search.onDataReceived(request);
                expect(request.sort).toHaveBeenCalledWith("fake");
            });
        });

        describe('updateStateForNewData function', function(){
            it('only sets state when full data response is false', function(){
                spyOn(search, 'setState');

                search.updateStateForNewData('foo');
                expect(search.setState).toHaveBeenCalledWith({itemList: 'foo', disabled: false});
            });

            it('edits additional properties when not a full data response', function(){
                spyOn(search, 'setState');
                search.props.isFullDataResponse = false;

                search.updateStateForNewData('foo');
                expect(search.setState).toHaveBeenCalledWith({itemList: 'foo', shownList: 'foo', disabled: false});
                expect(search.currentFilteredList).toEqual('foo');
            });
        });

        describe('getListOfMatchesForQuery function', function(){
            it('returns an empty array if no items are present', function(){
                search.state.itemList = [];
                expect(search.getListOfMatchesForQuery('')).toEqual([]);
            });

            it('returns empty array if no matches were found', function(){
                search.state.itemList = [{
                    name: 'ACME'
                }];

                expect(search.getListOfMatchesForQuery('item A')).toEqual([]);
            });

            it('returns matches if found and sorts results', function(){
                spyOn(search, 'sortMatchingEntries');

                search.state.itemList = [{
                    name: 'ACME'
                }];

                expect(search.getListOfMatchesForQuery('ME')).toEqual([{name: 'ACME', matchIndex: 2}]);
                expect(search.sortMatchingEntries.calls.count()).toEqual(0); //Sort won't get called with a single item

                search.state.itemList = [{
                    name: 'ACME'
                }, {
                    name: 'ME Item'
                }];

                expect(search.getListOfMatchesForQuery('ME')).toEqual([{name: 'ACME', matchIndex: 2}, {name: 'ME Item', matchIndex: 0}]);
                expect(search.sortMatchingEntries).toHaveBeenCalled();
            });

            it('lowercases and replaces spaces in search terms to find matches', function(){
                spyOn(search, 'sortMatchingEntries');
                search.state.itemList = [{
                    name: 'ACME'
                }];

                expect(search.getListOfMatchesForQuery('me')).toEqual([{name: 'ACME', matchIndex: 2}]);
                expect(search.getListOfMatchesForQuery('mE')).toEqual([{name: 'ACME', matchIndex: 2}]);

                search.state.itemList = [{
                    name: 'Item with spaces'
                }];

                expect(search.getListOfMatchesForQuery('with')).toEqual([{name: 'Item with spaces', matchIndex: 4}]);
                expect(search.getListOfMatchesForQuery('item with')).toEqual([{name: 'Item with spaces', matchIndex: 0}]);
                expect(search.getListOfMatchesForQuery('item            with')).toEqual([{name: 'Item with spaces', matchIndex: 0}]);

                search.state.itemList = [];
            });
        });

        describe('sortMatchingEntries function', function(){
            it('sorts based on match Index', function(){
                expect(search.sortMatchingEntries({matchIndex: 1}, {matchIndex: 0})).toEqual(1);
                expect(search.sortMatchingEntries({matchIndex: 100}, {matchIndex: 50})).toEqual(1);

                expect(search.sortMatchingEntries({matchIndex: 0}, {matchIndex: 1})).toEqual(-1);
                expect(search.sortMatchingEntries({matchIndex: 50}, {matchIndex: 100})).toEqual(-1);
            });

            it('sorts based on name if match index is the same', function(){
                expect(search.sortMatchingEntries({matchIndex: 1, name: 'abcd'}, {matchIndex: 1, name: 'abc'})).toEqual(1);
                expect(search.sortMatchingEntries({matchIndex: 1, name: 'longer item'}, {matchIndex: 1, name: 'short item'})).toEqual(1);

                expect(search.sortMatchingEntries({matchIndex: 1, name: 'abc'}, {matchIndex: 1, name: 'abcd'})).toEqual(-1);
                expect(search.sortMatchingEntries({matchIndex: 1, name: 'short item'}, {matchIndex: 1, name: 'longer item'})).toEqual(-1);
            });

            it('sorts alphabetically if all others are the same', function(){
                expect(search.sortMatchingEntries({matchIndex: 1, name: 'cbs'}, {matchIndex: 1, name: 'abc'})).toEqual(1);
                expect(search.sortMatchingEntries({matchIndex: 1, name: 'cnn'}, {matchIndex: 1, name: 'bbc'})).toEqual(1);

                expect(search.sortMatchingEntries({matchIndex: 1, name: 'abc'}, {matchIndex: 1, name: 'bbc'})).toEqual(-1);
                expect(search.sortMatchingEntries({matchIndex: 1, name: 'a'}, {matchIndex: 1, name: 'b'})).toEqual(-1);
            });

            it('returns 0 if items are identical', function(){
                expect(search.sortMatchingEntries({matchIndex: 1, name: 'abc'}, {matchIndex: 1, name: 'abc'})).toEqual(0);
                expect(search.sortMatchingEntries({matchIndex: 1, name: 'a'}, {matchIndex: 1, name: 'a'})).toEqual(0);
            });

            it('returns items with a match index above those without', function(){
                expect(search.sortMatchingEntries({name: 'abc'}, {matchIndex: 1, name: 'abc'})).toEqual(1);
                expect(search.sortMatchingEntries({matchIndex: 1, name: 'abc'}, {name: 'abc'})).toEqual(-1);
                expect(search.sortMatchingEntries({name: 'abc'}, {name: 'abc'})).toEqual(0);
            });

            it('prefers primary match index over secondary', function(){
                expect(search.sortMatchingEntries({secondaryMatchIndex: 0, name: 'abc'}, {matchIndex: 1, name: 'abc'})).toEqual(1);
                expect(search.sortMatchingEntries({matchIndex: 0, name: 'abc'}, {secondaryMatchIndex: 1, name: 'abc'})).toEqual(-1);
            });

            it('uses secondary index if neither has a primary', function(){
                expect(search.sortMatchingEntries({secondaryMatchIndex: 0, name: 'abc'}, {secondaryMatchIndex: 1, name: 'abc'})).toEqual(-1);
                expect(search.sortMatchingEntries({secondaryMatchIndex: 1, name: 'abc'}, {secondaryMatchIndex: 0, name: 'abc'})).toEqual(1);
                expect(search.sortMatchingEntries({secondaryMatchIndex: 0, name: 'abc'}, {secondaryMatchIndex: 0, name: 'abc'})).toEqual(0);
            });
        });

        describe('onChange function', function(){
            it('clears list when search term length is 0', function(){
                spyOn(search, 'setState');

                search.onChange({target: {value: ''}});

                expect(search.setState).toHaveBeenCalledWith({inputValue: ''});
                expect(search.setState).toHaveBeenCalledWith({shownList: []});
            });

            it('gets list of matches and sets list', function(){
                spyOn(search, 'setState');
                spyOn(search, 'getListOfMatchesForQuery').and.returnValue(['foo', 'bar']);

                search.onChange({target: {value: 'search term'}});

                expect(search.setState).toHaveBeenCalledWith({inputValue: 'search term'});
                expect(search.getListOfMatchesForQuery).toHaveBeenCalledWith('search term');
                expect(search.setState).toHaveBeenCalledWith({shownList: ['foo', 'bar']});
                expect(search.currentFilteredList).toEqual(['foo', 'bar']);
            });

            it('makes reqeust for each change if not full data response', function(){
                search.props.isFullDataResponse = false;
                spyOn(search, 'requestDataForTerm');

                search.onChange({target: {value: 'term'}});

                expect(search.requestDataForTerm).toHaveBeenCalledWith('term');
            });
        });

        describe('onFocus function', function(){
            it('shows list on focus', function(){
                spyOn(search, 'setState');

                search.currentFilteredList = ['foo'];
                search.onFocus();

                expect(search.focusedIndex).toBeNull();
                expect(search.setState).toHaveBeenCalledWith({shownList: ['foo'], inputFocused: true});
            });
        });

        describe('onBlur function', function(){
            it('only calls hidelist if actionOverList', function(){
                spyOn(search, 'hideList');

                search.actionOverList = true;

                search.onBlur();
                expect(search.hideList.calls.count()).toEqual(0);

                search.actionOverList = false;

                search.onBlur();
                expect(search.hideList).toHaveBeenCalledWith();
            });
        });

        describe('onInputKeyPress function', function(){
            it('skips if value entered was something other than escape or key down', function(){
                expect(search.onInputKeyPress({})).toBeUndefined();
                expect(search.onInputKeyPress({keyCode: null})).toBeUndefined();
                expect(search.onInputKeyPress({keyCode: 10})).toBeUndefined();
            });

            it('calls correct handler depending on key code', function(){
                spyOn(search, 'focusNext');
                spyOn(search, 'setState');
                var preventDefaultSpy = jasmine.createSpy();
                var eventObj = {
                    keyCode: 40,
                    preventDefault: preventDefaultSpy
                };

                search.onInputKeyPress(eventObj);
                expect(preventDefaultSpy).toHaveBeenCalledWith();
                expect(search.focusNext).toHaveBeenCalledWith();
                expect(search.setState.calls.count()).toEqual(0);

                //Escape key press
                eventObj.keyCode = 27;

                search.onInputKeyPress(eventObj);
                expect(preventDefaultSpy).toHaveBeenCalledWith();
                expect(search.currentFilteredList).toEqual([]);
                expect(search.setState).toHaveBeenCalledWith({shownList: [], inputValue: ''});

                //Enter key press
                eventObj.keyCode = 13;
                search.state.inputValue = "search term";
                search.setState.calls.reset();
                preventDefaultSpy.calls.reset();

                search.onInputKeyPress(eventObj);

                expect(preventDefaultSpy).toHaveBeenCalledWith();
                expect(search.currentFilteredList).toEqual([]);
                expect(search.setState).toHaveBeenCalledWith({shownList: [], inputValue: ''});
                expect(onInputSubmitCallback).toHaveBeenCalledWith("search term");
            });
        });

        describe('onListKeyPress function', function(){
            it('returns when no handler is present', function(){
                expect(search.onListKeyPress({keyCode: 'foo'})).toBeUndefined();
                expect(search.onListKeyPress({keyCode: 2})).toBeUndefined();

                search.listKeyCodeHandlers.foo = 'functionThatDoesntExist';
                expect(search.onListKeyPress({keyCode: "functionThatDoesntExist"})).toBeUndefined();
            });

            it('invokes handler when present', function(){
                spyOn(search, 'focusPrev');

                var preventDefaultSpy = jasmine.createSpy();
                var eventObj = {
                    keyCode: 38,
                    preventDefault: preventDefaultSpy
                };
                search.onListKeyPress(eventObj);
                expect(preventDefaultSpy).toHaveBeenCalledWith();
                expect(search.focusPrev).toHaveBeenCalledWith();
            });
        });

        describe('focusNext function', function(){
            it('calls focus on correct index', function(){
                spyOn(search, 'focusOnItemAtIndex');

                search.focusedIndex = null;

                search.focusNext();
                expect(search.focusOnItemAtIndex).toHaveBeenCalledWith(0);

                search.focusedIndex = 10;

                search.focusNext();
                expect(search.focusOnItemAtIndex).toHaveBeenCalledWith(11);
            });
        });

        describe('focusPrev function', function(){
            it('calls focus on correct index', function(){
                spyOn(search, 'focusOnItemAtIndex');

                search.focusedIndex = null;
                search.focusPrev();
                expect(search.focusOnItemAtIndex.calls.count()).toEqual(0);

                search.focusedIndex = 0;
                search.focusPrev();
                expect(search.focusOnItemAtIndex.calls.count()).toEqual(0);

                search.focusedIndex = 10;
                search.focusPrev();
                expect(search.focusOnItemAtIndex).toHaveBeenCalledWith(9);
            });
        });

        describe('focusOnItemAtIndex function', function(){
            it('sets index and action properties', function(){
                search.focusedIndex = null;
                search.actionOverList = false;

                search.focusOnItemAtIndex(-1);

                expect(search.focusedIndex).toBeNull();
                expect(search.actionOverList).toBeFalse();

                var originalRef = search.refs;
                var focusSpy = jasmine.createSpy();
                search.refs = {list: {
                    getDOMNode: function(){
                        return {childNodes: [1, 2, 3, 4, {focus: focusSpy}]};
                    }
                }};

                search.focusOnItemAtIndex(4);

                expect(search.focusedIndex).toEqual(4);
                expect(search.actionOverList).toBeTrue();
                expect(focusSpy).toHaveBeenCalledWith();

                search.refs = originalRef;
            });
        });

        describe('clearList function', function(){
            it('resets values', function(){
                spyOn(search, 'setState');
                spyOn(search, 'hideList');

                search.clearList(true);
                expect(search.actionOverList).toEqual(false);
                expect(search.currentFilteredList).toEqual([]);
                expect(search.setState).toHaveBeenCalledWith({inputValue: ''});
                expect(search.hideList).toHaveBeenCalledWith();
                search.clearList(false);
            });
        });

        describe('hideList function', function(){
            it('resets values', function(){
                spyOn(search, 'setState');

                search.state.shownList = [];
                search.state.inputFocused = true;
                search.hideList(true);
                expect(search.focusedIndex).toBeNull();
                expect(search.setState).toHaveBeenCalledWith({shownList: [], inputFocused: false});

                search.state.shownList = ['item'];
                search.state.inputFocused = false;
                search.hideList(true);
                expect(search.focusedIndex).toBeNull();
                expect(search.setState).toHaveBeenCalledWith({shownList: [], inputFocused: false});
            });
        });

        describe('selectItemOnEnter function', function(){
            it('calls itemSelect', function(){
                spyOn(search, 'itemSelect');

                search.selectItemOnEnter();
                expect(search.itemSelect).toHaveBeenCalledWith({target: undefined});
            });
        });

        describe('itemSelect', function(){
            it('clears list', function(){
                search.props.onSelect = null;
                spyOn(search, 'clearList');

                search.itemSelect();

                expect(search.clearList).toHaveBeenCalledWith(true);
            });

            it('invokes onSelect when specified', function(){
                var searchEvent = {
                    foo: 'bar'
                };
                search.state.inputValue = "search term";

                search.itemSelect(searchEvent);

                expect(searchSubmitCallback).toHaveBeenCalledWith(searchEvent, "search term");
            });
        });

        describe('handleListMouseEnter function', function(){
            it('calls focus on target', function(){
                search.actionOverList = false;
                var focusSpy = jasmine.createSpy();

                search.handleListMouseEnter({target: {focus: focusSpy}});

                expect(search.actionOverList).toBeTrue();
                expect(focusSpy).toHaveBeenCalledWith();
            });
        });

        describe('handleListMouseLeave function', function(){
            it('calls focus on target', function(){
                search.actionOverList = true;

                search.handleListMouseLeave();

                expect(search.actionOverList).toBeFalse();
            });
        });

        describe('getAutocompleteComponents function', function(){
            it('adds markup for each item', function(){
                var rowData = [
                    {
                        id: 10,
                        name: 'acme'
                    },
                    {
                        id: 20,
                        name: 'Apl'
                    }
                ];

                var list = search.getAutocompleteComponents(rowData);
                expect(list).toBeArrayOfSize(2);

                var firstItemItem = TestUtils.renderIntoDocument(list[0]),
                    secondItemItem = TestUtils.renderIntoDocument(list[1]);

                expect(TestUtils.isDOMComponent(firstItemItem)).toBeTrue();
                expect(TestUtils.isDOMComponent(secondItemItem)).toBeTrue();

                expect(firstItemItem.props['data-id']).toEqual(10);
                expect(firstItemItem.props.tabIndex).toEqual('-1');
                expect(firstItemItem.props.children).toEqual('acme');

                expect(secondItemItem.props['data-id']).toEqual(20);
                expect(secondItemItem.props.tabIndex).toEqual('-1');
                expect(secondItemItem.props.children).toEqual('Apl');

                search.state.shownList = [];
            });
        });
    });
});
