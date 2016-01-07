define(function(require) {
    var PortalMixins = require('../../mixins/PortalMixins');
    var React = require('react');
    var Utils = require('../Utils');

    var TestUtils = require('react-addons-test-utils');

    describe('Utils', function() {
        describe('guid', function() {
            it('should generate a unique identifier', function() {
                var id1 = Utils.guid();
                var id2 = Utils.guid();
                expect(id1).not.toEqual(id2);
                expect(id1).toEqual(jasmine.any(String));
            });
        });

        describe('calculateTimeString', function() {
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

        describe('getLoaderClasses', function() {
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

        describe('classSet function', function(){
            it('returns empty string when no parameters or invalid parameters', function(){
                expect(Utils.classSet()).toEqual('');
                expect(Utils.classSet(null)).toEqual('');
                expect(Utils.classSet(false)).toEqual('');
                expect(Utils.classSet(true, true, true)).toEqual('');
            });

            it('returns classnames for literal strings or numbers', function(){
                expect(Utils.classSet(1)).toEqual('1');
                expect(Utils.classSet('foo')).toEqual('foo');
                expect(Utils.classSet(1, 'one', 2, 'two')).toEqual('1 one 2 two');
            });

            it('returns classnames for objects with truthy values', function(){
                expect(Utils.classSet({foo: 'bar'})).toEqual('foo');
                expect(Utils.classSet({foo: 1})).toEqual('foo');
                expect(Utils.classSet({foo: true})).toEqual('foo');
                expect(Utils.classSet({foo: [1]})).toEqual('foo');

                expect(Utils.classSet({foo: 1, bar: 0})).toEqual('foo');
                expect(Utils.classSet({foo: 1, bar: false})).toEqual('foo');
                expect(Utils.classSet({foo: 1, bar: null})).toEqual('foo');

                expect(Utils.classSet({foo: 1, bar: true, baz: 'yes'})).toEqual('foo bar baz');
            });
        });

        describe('extendReactClass', function() {
            var base = {
                keepMe: function() {
                    return 'kept';
                },
                clobberMe: function() {
                    return 'clobber me';
                },
                render: function() {
                    return <div></div>
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

        describe('pageMessage', function() {
            it('should close any open portals and open a new portal with a PageMessage component', function() {
                spyOn(PortalMixins, 'closePortal');
                spyOn(PortalMixins, 'openPortal');

                Utils.pageMessage('Some instructional or informational message.', 'Type', {option: 'val'});

                expect(PortalMixins.closePortal.calls.count()).toEqual(1);
                expect(PortalMixins.openPortal.calls.count()).toEqual(1);
                expect(PortalMixins.openPortal.calls.argsFor(0)[0].props.message).toEqual('Some instructional or informational message.');
                expect(PortalMixins.openPortal.calls.argsFor(0)[0].props.type).toEqual('type');
                expect(PortalMixins.openPortal.calls.argsFor(0)[0].props.option).toEqual('val');
            });

            it('should use a message of a pre-configured type', function() {
                spyOn(PortalMixins, 'closePortal');
                spyOn(PortalMixins, 'openPortal');

                expect(function() {Utils.pageMessage('mssg', 'success', {option: 'val'})}).not.toThrow();
            });
        });

        describe('confirmDialog', function(){
            it('copies over ok handler if provided', function(){
                spyOn(PortalMixins, 'closePortal');
                spyOn(PortalMixins, 'openPortal');

                var okHandler = function(){};

                Utils.confirmDialog('title', 'subtitle', okHandler);

                expect(PortalMixins.closePortal).toHaveBeenCalled();

                var modal = PortalMixins.openPortal.calls.argsFor(0)[0];
                var confirmDialog = modal.props.children;
                expect(confirmDialog.props.okButtonClickHandler).toEqual(okHandler);
                expect(confirmDialog.props.cancelButtonClickHandler).toBeFunction();//Pulls empty function from default props
            });

            it('copies over cancel handler if provided', function(){
                spyOn(PortalMixins, 'closePortal');
                spyOn(PortalMixins, 'openPortal');

                var cancelHandler = function(){};

                Utils.confirmDialog('title', 'subtitle', null, cancelHandler);

                var modal = PortalMixins.openPortal.calls.argsFor(0)[0];
                var confirmDialog = modal.props.children;
                expect(confirmDialog.props.cancelButtonClickHandler).toEqual(cancelHandler);
            });

            it('sets correct props on modal', function(){
                spyOn(PortalMixins, 'closePortal');
                spyOn(PortalMixins, 'openPortal');

                Utils.confirmDialog('title', 'subtitle');

                var modal = PortalMixins.openPortal.calls.argsFor(0)[0];
                expect(modal.props.showCloseIcon).toBeFalse();
                expect(modal.props.backgroundClickToClose).toBeFalse();
            });
        });
    });
});
