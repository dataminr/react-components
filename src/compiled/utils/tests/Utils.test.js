define(function(require) {
    var Moment = require('moment');
    var React = require('react');
    var Utils = require('drc/utils/Utils');

    var TestUtils = React.addons.TestUtils;

    describe('Utils', function() {
        describe('guid function', function() {
            it('should generate a unique identifier', function() {
                var id1 = Utils.guid();
                var id2 = Utils.guid();
                expect(id1).not.toEqual(id2);
                expect(id1).toEqual(jasmine.any(String));
            });
        });

        describe('calculateTimeString function', function() {
            var start = '2015-02-04T15:25:34.931Z';
            var end = '2015-02-04T15:30:05.553Z';
            it('should lead with a space, contain a colon and AM/PM in times, and not include a date if the date bool is false or missing.', function() {
                var timeString = Utils.calculateTimeString(start, end);
                // lead with
                expect(timeString.indexOf(' ')).toEqual(0);
                // start time in range
                expect(timeString.indexOf('AM')).not.toEqual(-1);
                // end time in range
                expect(timeString.lastIndexOf('AM')).not.toEqual(-1);
                expect(timeString.lastIndexOf('AM')).not.toEqual(timeString.indexOf('AM'));
            });

            it('should not lead with a space and include a date if the date bool is true.', function() {
                var timeString = Utils.calculateTimeString(start, end, true);
                // start with a date
                expect(timeString.indexOf('Feb 4th, ')).toEqual(0);
                // start time in range
                expect(timeString.indexOf('AM')).not.toEqual(-1);
                // end time in range
                expect(timeString.lastIndexOf('AM')).not.toEqual(-1);
                expect(timeString.lastIndexOf('AM')).not.toEqual(timeString.indexOf('AM'));
            });

            it('should have a single time rather than a date if the start and end times are in the same minute.', function() {
                var timeString = Utils.calculateTimeString(start, start);
                // lead with
                expect(timeString.indexOf(' ')).toEqual(0);
                // start time in range
                expect(timeString.indexOf('AM')).not.toEqual(-1);
                // no end time in range
                expect(timeString.lastIndexOf('AM')).not.toEqual(-1);
                expect(timeString.lastIndexOf('AM')).toEqual(timeString.indexOf('AM'));
            });
        });

        describe('getLoaderClasses function', function() {
            var firstClass = 'test-class';
            var secondClass = 'test-class-two';
            it('should use default icon classes.', function() {
                expect(Utils.getLoaderClasses(true)).toEqual('loader icon ion-loading-c');
            });

            it('should handle a single icon class.', function() {
                expect(Utils.getLoaderClasses(true, firstClass)).toEqual('loader ' + firstClass);
            });

            it('should handle space delineated icon classes.', function() {
                var multiClassString = firstClass + ' ' + secondClass;
                expect(Utils.getLoaderClasses(true, multiClassString)).toEqual('loader ' + firstClass + ' ' + secondClass);
            });

            it('should handle an array of icon classes.', function() {
                var multiClassArray = [firstClass, secondClass];
                expect(Utils.getLoaderClasses(true, multiClassArray)).toEqual('loader ' + firstClass + ' ' + secondClass);
            });

            it('should not have a hide class when loading.', function() {
                expect(Utils.getLoaderClasses(true)).toEqual('loader icon ion-loading-c');
            });

            it('should have a hide class when not loading.', function() {
                expect(Utils.getLoaderClasses(false)).toEqual('loader hide');
            });
        });

        describe('extendReactClass function', function() {
            var base = {
                keepMe: function() {
                    return 'kept';
                },
                clobberMe: function() {
                    return 'clobber me';
                },
                render: function() {
                    return React.createElement("div", null)
                }
            };
            var clobber = {
                clobberMe: function() {
                    return 'clobbered';
                }
            };
            var add = {
                addMe: function() {
                    return 'added';
                }
            };
            var reactClass;

            beforeEach(function() {
                spyOn(React, 'createClass').and.callThrough();
                reactClass = TestUtils.renderIntoDocument(React.createElement(Utils.extendReactClass(base, clobber, add)));
            });

            it('should not modify the base object directly.', function() {
                expect(base.clobberMe()).toEqual('clobber me');
            });

            it('should extend a base object and clobber functions already existing on the base.', function() {
                expect(reactClass.keepMe()).toEqual('kept');
                expect(reactClass.clobberMe()).toEqual('clobbered');
            });

            it('should add new functionality.', function() {
                expect(reactClass.addMe()).toEqual('added');
            });

            it('should create a React class.', function() {
                expect(React.createClass).toHaveBeenCalled();
            });
        });
    });
});
