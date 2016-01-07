var PortalMixins = require('../PortalMixins');
var React = require('react');
var ReactDOM = require('react-dom');

describe('PortalMixins', function() {
    describe('openPortal', function() {
        it('should open a portal and set the portalNode', function() {
            PortalMixins.openPortal(<div id="portal"></div>);

            expect(PortalMixins.portalNode.childNodes[0].id).toEqual('portal');
        });
    });

    describe('setPortalConfirmOnClose', function() {
        it('should set the value for portalConfirmOnCloseMessage', function() {
            expect(PortalMixins.portalConfirmOnCloseMessage).toBeUndefined();
            PortalMixins.setPortalConfirmOnClose('test message');
            expect(PortalMixins.portalConfirmOnCloseMessage).toEqual('test message');
            PortalMixins.setPortalConfirmOnClose(null);
            expect(PortalMixins.portalConfirmOnCloseMessage).toBeNull();
        });
    });

    describe('closePortal', function() {
        it('should close the portal if the portal is open and not throw an error if the portal was already closed', function() {
            PortalMixins.closePortal();

            expect(this.portalNode).toBeUndefined();
            delete(this.portalNode);

            expect(function() {PortalMixins.closePortal();}).not.toThrow();
        });

        it('should close the portal if the portalConfirmOnCloseMessage is set and the user confirmed', function() {
            PortalMixins.openPortal(<div id="portal"></div>);
            spyOn(window, 'confirm').and.returnValue(true);
            PortalMixins.portalConfirmOnCloseMessage = 'mssg';
            spyOn(ReactDOM, 'unmountComponentAtNode');

            PortalMixins.closePortal();

            expect(PortalMixins.portalNode).toBeFalsy();
        });

        it('should not close the portal if portalConfirmOnCloseMessage is set and the user cancels ', function() {
            PortalMixins.openPortal(<div id="portal"></div>);
            spyOn(window, 'confirm').and.returnValue(false);
            PortalMixins.portalConfirmOnCloseMessage = 'mssg';
            spyOn(ReactDOM, 'unmountComponentAtNode');

            PortalMixins.closePortal();

            expect(PortalMixins.portalNode).toBeTruthy();

            // cleanup
            ReactDOM.unmountComponentAtNode(PortalMixins.portalNode);
            PortalMixins.portalNode = null;
        });
    });
});
