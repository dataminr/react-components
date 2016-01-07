var ExpandedTestUtils = require('expanded-react-test-utils');
var PageMessage = require('../PageMessage');
var PortalMixins = require('../../mixins/PortalMixins');
var React = require('react');
var TestUtils = require('react-addons-test-utils');

describe('PageMessage', function() {
    var pageMessage;

    beforeEach(function() {
        var props = {
            message: 'Message',
            type: 'message',
            duration: 1500,
            icon: 'iconClass',
            closeIcon: 'closeIconClass'
        };

        jasmine.clock().install();
        pageMessage = TestUtils.renderIntoDocument(<PageMessage {...props} />);
    });

    afterEach(function() {
        jasmine.clock().tick(5000);
        jasmine.clock().uninstall();
    });

    describe('getInitialState', function() {
        it('should set the leaving state to false', function() {
            expect(pageMessage.getInitialState()).toEqual({leaving: false});
        });
    });

    describe('componentDidMount', function() {
        it('should call dismiss with animation after the set duration', function() {
            spyOn(pageMessage, 'dismiss');

            expect(pageMessage.dismiss).not.toHaveBeenCalled();
            jasmine.clock().tick(pageMessage.props.duration);
            expect(pageMessage.dismiss.calls.count()).toEqual(1);
            expect(pageMessage.dismiss).toHaveBeenCalledWith(true);
        });

        it('should not call dismiss with animation after the set duration if the duration is 0', function() {
            pageMessage = TestUtils.renderIntoDocument(<PageMessage message='Message' type='message' duration={0} />);
            spyOn(pageMessage, 'dismiss');

            jasmine.clock().tick(10000);
            expect(pageMessage.dismiss).not.toHaveBeenCalled();
        });
    });

    describe('componentWillUnmount', function() {
        it('should clear the setTimeout', function() {
            expect(pageMessage.timeout).toBeTruthy();
            pageMessage.componentWillUnmount();
            expect(pageMessage.timeout).toBeFalsy();
        });
    });

    describe('render', function() {
        it('should display the required markup and request the message markup', function() {
            var markup = pageMessage.render();
            expect(markup.type).toEqual('div');
            expect(markup.props.className).toEqual('page-message');
            expect(markup.props.children.props.transitionName).toEqual('message');
            expect(markup.props.children.props.transitionAppear).toBeTrue();
        });
    });

    describe('getMessageMarkup', function() {
        it('should return the message if it is in a leaving state', function() {
            expect(ExpandedTestUtils.findComponentCountWithSelector(pageMessage, '.message', 1)).toBeTrue();
            pageMessage.state.leaving = true;
            expect(pageMessage.getMessageMarkup()).toBeNull();
        });

        it('should not display a close icon if one was not set', function() {
            pageMessage = TestUtils.renderIntoDocument(<PageMessage message='Message' type='message' />);
            expect(ExpandedTestUtils.findComponentCountWithSelector(pageMessage, 'i.close', 0)).toBeTrue();
        });

        it('should display a close icon if one was set', function() {
            pageMessage = TestUtils.renderIntoDocument(<PageMessage message='Message' type='message' closeIcon="closeIconClass" />);
            expect(ExpandedTestUtils.findComponentCountWithSelector(pageMessage, 'i.close', 1)).toBeTrue();
            expect(ExpandedTestUtils.findComponentCountWithSelector(pageMessage, 'i.closeIconClass', 1)).toBeTrue();
        });

        it('should not display an icon if one was not set', function() {
            pageMessage = TestUtils.renderIntoDocument(<PageMessage message='Message' type='message' />);
            expect(ExpandedTestUtils.findComponentCountWithSelector(pageMessage, 'i', 0)).toBeTrue();
        });

        it('should display an icon if one was set', function() {
            pageMessage = TestUtils.renderIntoDocument(<PageMessage message='Message' type='message' icon="iconClass" />);
            expect(ExpandedTestUtils.findComponentCountWithSelector(pageMessage, 'i.iconClass', 1)).toBeTrue();
        });
    });

    describe('dismiss', function() {
        it('should set the PageMessage component state to a leaving state.', function() {
            expect(pageMessage.state.leaving).toBeFalse();
            pageMessage.dismiss(true);
            expect(pageMessage.state.leaving).toBeTrue();
        });

        it('should close the portal after the animation allowance time frame if animating', function() {
            spyOn(PortalMixins, 'closePortal').and.callThrough();
            pageMessage.dismiss(true);
            jasmine.clock().tick(1);
            expect(PortalMixins.closePortal.calls.count()).toEqual(0);
            jasmine.clock().tick(1000);
            expect(PortalMixins.closePortal.calls.count()).toEqual(1);
        });

        it('should close the portal immediately if not animating', function() {
            spyOn(PortalMixins, 'closePortal').and.callThrough();
            pageMessage.dismiss();
            jasmine.clock().tick(1);
            expect(PortalMixins.closePortal.calls.count()).toEqual(1);
        });
    });
});
