define(function(require) {
    var _ = require('lodash');
    var PieChartActions = require('drc/pie-chart/PieChartActions');
    var PieChartStore = require('drc/pie-chart/PieChartStore');
    var Utils = require('drc/utils/Utils');

    var ActionTypes = PieChartActions.actionTypes;

    describe('PieChartStore', function() {
        var definition = {
            url: '/test',
            label: 'TEST'
        };
        var id = 'pie-chart' + Utils.guid();
        var pieChart;
        var data = [
            {
                percent: 40,
                value: 1999
            },
            {
                percent: 35.8,
                value: 1789
            },
            {
                percent: 24.2,
                value: 1211
            }
        ];

        describe('PieChartStore', function() {
            afterEach(function() {
                PieChartStore.collection = {};
            });

            describe('createInstance function', function() {
                it('should create an instance of the PieChart class and add it to the collection.', function() {
                    PieChartStore.createInstance(id, {test: 'definition'});
                    expect(_.size(PieChartStore.collection)).toEqual(1);
                    expect(PieChartStore.collection[id]).toBeObject();
                });
            });

            describe('destroyInstance function', function() {
                it('should remove an item from the collection.', function() {
                    PieChartStore.collection[id] = {test: 'object'};
                    PieChartStore.destroyInstance(id);
                    expect(_.isEmpty(PieChartStore.collection)).toBeTruthy();
                });
            });

            describe('getData function', function() {
                it('should request the data for a pie chart instance.', function() {
                    PieChartStore.collection[id] = {
                        getData: function() {
                            return 'data';
                        }
                    };
                    expect(PieChartStore.getData(id)).toEqual('data');
                });
            });

            describe('getLabel function', function() {
                it('should request the label for a pie chart instance.', function() {
                    PieChartStore.collection[id] = {
                        getLabel: function() {
                            return 'label';
                        }
                    };
                    expect(PieChartStore.getLabel(id)).toEqual('label');
                });

                it('should not request the label for a pie chart instance that is no longer in the collection.', function() {
                    PieChartStore.collection[id] = {
                        getLabel: function() {
                            return 'label';
                        }
                    };
                    delete PieChartStore.collection[id];
                    expect(PieChartStore.getLabel(id)).toBeUndefined();
                });
            });

            describe('dispatchRegister function', function() {
                it('should not handle the action if the component type is not supported.', function() {
                    var payload = {
                        action: {
                            actionType: ActionTypes.REQUEST_DATA
                        }
                    };
                    spyOn(PieChartStore, 'handleRequestDataAction');
                    PieChartStore.dispatchRegister(payload);

                    expect(PieChartStore.handleRequestDataAction).not.toHaveBeenCalled();
                });

                it('should handle the action if the component type is supported, but not emit a change if the action is not defined.', function() {
                    var payload = {
                        action: {
                            actionType: 'thisActionIsNotSupported',
                            component: 'PieChart'
                        }
                    };
                    spyOn(PieChartStore, 'emitChange');
                    PieChartStore.dispatchRegister(payload);

                    expect(PieChartStore.emitChange).not.toHaveBeenCalled();
                });

                it('should call the handleRequestDataAction function when the action is requesting data.', function() {
                    var payload = {
                        action: {
                            actionType: ActionTypes.REQUEST_DATA,
                            component: 'PieChart'
                        }
                    };

                    spyOn(PieChartStore, 'handleRequestDataAction');
                    PieChartStore.dispatchRegister(payload);

                    expect(PieChartStore.handleRequestDataAction).toHaveBeenCalledWith(payload.action);
                });

                it('should call the destroy instance function when the action is requesting that an instance be destroyed.', function() {
                    var payload = {
                        action: {
                            actionType: ActionTypes.DESTROY_INSTANCE,
                            component: 'PieChart',
                            id: id
                        }
                    };

                    spyOn(PieChartStore, 'destroyInstance');
                    PieChartStore.dispatchRegister(payload);

                    expect(PieChartStore.destroyInstance).toHaveBeenCalledWith(payload.action.id);
                });
            });

            describe('PieChart class', function() {
                beforeEach(function() {
                    pieChart = new PieChartStore.PieChart(id, definition);
                });

                describe('PieChart constructor', function() {
                    it('should construct the pie chart with all of the expected properties.', function() {
                        expect(pieChart.id).toEqual(id);
                        expect(pieChart.label).toEqual(definition.label);
                    });
                });

                describe('onDataReceived', function() {
                    it('should copy the data received to the pie chart data.', function() {
                        pieChart.onDataReceived(_.clone(data));

                        expect(pieChart.data).toEqual(data);
                    });
                });

                describe('error function', function() {
                    it('should set the data to null.', function() {
                        pieChart.data = 'testing';
                        pieChart.errorFunction();

                        expect(pieChart.data).not.toEqual('testing');
                        expect(pieChart.data).toBeNull();
                    });
                });

                describe('getData function', function() {
                    it('should retrieve the data for the pie chart.', function() {
                        pieChart.onDataReceived(_.clone(data));
                        var instanceData = pieChart.getData();
                        expect(instanceData).toEqual(data);
                    });
                });

                describe('getLabel function', function() {
                    it('should retrieve the label for the pie chart.', function() {
                        expect(pieChart.getLabel()).toEqual(definition.label);
                    });
                });
            });
        });
    });
});
