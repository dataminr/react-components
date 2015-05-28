define(function(require) {
    var DataMixins = require('drc/mixins/DataMixins');
    var React = require('react');

    var TestUtils = React.addons.TestUtils;

    describe('DataMixins', function() {
        var MockActions = {
            destroyInstance: function() {}
        };
        var MockStore = {
            on: function() {},
            removeListener: function() {}
        };

        var MockChild = React.createClass({displayName: 'MockChild',
            mixins: [
                DataMixins.dataRequest,
                DataMixins.destroySelfOnUnmount(MockActions),
                DataMixins.eventSubscription(MockStore)
            ],
            render: function() {
                return React.createElement("div", null, "Mock Child");
            },
            requestData: function() {}
        });
        var Mock = React.createClass({displayName: 'Mock',
            getInitialState: function() {
                return {
                    updated: false,
                    filters: {
                        test1: 'unchanged',
                        test2: 'unchanged'
                    }
                };
            },

            render: function() {
                return React.createElement(MockChild, {ref: "mockChild", filters: this.state.filters});
            }
        });
        var mock;

        beforeEach(function() {
            mock = TestUtils.renderIntoDocument(React.createElement(Mock, null));
        });

        describe('dataRequest mixin', function() {
            describe('componentWillUpdate function when filters change', function() {
                beforeEach(function (done) {
                    spyOn(mock.refs.mockChild, 'requestData');
                    mock.setState({
                        updated: true,
                        filters: {
                            test: 'changed'
                        }
                    });
                    setTimeout(function() {
                        done();
                    }, 1);
                });

                it('should request data when filters have changed when updating', function(done) {
                    // The first call is from the initial mount.
                    expect(mock.refs.mockChild.requestData.calls.count()).toEqual(2);
                    done();
                });
            });

            describe('componentWillUpdate function when filters do not change', function() {
                beforeEach(function (done) {
                    spyOn(mock.refs.mockChild, 'requestData');
                    mock.setState({
                        updated: true
                    });
                    setTimeout(function() {
                        done();
                    }, 1);
                });

                it('should not request data when filters have not changed when updating', function(done) {
                    // The single call is from the initial mount.
                    expect(mock.refs.mockChild.requestData.calls.count()).toEqual(1);
                    done();
                });
            });

            describe('componentWillUpdate function uses JSON encoding to check update status', function() {
                var UpdateMockChild, UpdateMockParent;

                beforeEach(function () {
                    UpdateMockChild = React.createClass({displayName: 'UpdateMockChild',
                        mixins: [DataMixins.dataRequest],
                        render: function() {
                            return React.createElement("div", null, "Mock Child");
                        },
                        requestData: function(){}
                    });
                    UpdateMockParent = React.createClass({displayName: 'UpdateMockParent',
                        render: function() {
                            return React.createElement(UpdateMockChild, {ref: "mockChild", filters: {foo: 'bar'}});
                        }
                    });
                });

                it('doesnt call request data if object is new object literal', function(done) {
                    var mock = TestUtils.renderIntoDocument(React.createElement(UpdateMockParent, null));
                    spyOn(mock.refs.mockChild, 'requestData');
                    mock.forceUpdate();
                    setTimeout(function(){
                        //Should only have invoked 1 mock, even though prop is a literal object
                        expect(mock.refs.mockChild.requestData.calls.count()).toEqual(1);
                        done();
                    }, 1);
                });
            });

            describe('componentDidMount function', function() {
                beforeEach(function (done) {
                    spyOn(mock.refs.mockChild, 'requestData');
                    setTimeout(function() {
                        done();
                    }, 1);
                });

                it('should request data when mounting', function(done) {
                    expect(mock.refs.mockChild.requestData.calls.count()).toEqual(1);
                    done();
                });
            });
        });

        describe('destroySelfOnUnmount mixin', function() {
            describe('componentWillUnmount function', function() {
                beforeEach(function (done) {
                    spyOn(MockActions, 'destroyInstance');
                    mock.refs.mockChild.componentWillUnmount();
                    setTimeout(function() {
                        done();
                    }, 1);
                });

                it('should trigger an action to destroy itself when unmounting', function(done) {
                    expect(MockActions.destroyInstance).toHaveBeenCalled();
                    done();
                });
            });
        });

        describe('eventSubscription mixin', function() {
            describe('componentDidMount function', function() {
                it('should add change and fail listeners to the store when mounting', function() {
                    spyOn(MockStore, 'on');
                    mock.refs.mockChild.componentDidMount();
                    expect(MockStore.on.calls.count()).toEqual(2);
                });
            });

            describe('componentWillUnmount function', function() {
                it('should remove change and fail listeners from the store when unmounting', function() {
                    spyOn(MockStore, 'removeListener');
                    mock.refs.mockChild.componentWillUnmount();
                    expect(MockStore.removeListener.calls.count()).toEqual(2);
                });
            });
        });
    });
});
