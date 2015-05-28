define(function(require) {
    'use strict';

    var PortalMixins = require('drc/mixins/PortalMixins');
    var React = require('react');

    describe('PortalMixins', function() {
        describe('openPortal function', function() {
            it('should open a portal and set the portalNode', function() {
                PortalMixins.openPortal(React.createElement("div", {id: "portal"}));

                expect(PortalMixins.portalNode.childNodes[0].id).toEqual('portal');
            });
        });

        describe('closePortal function', function() {
            it('should close the portal if the portal is open and not throw an error if the portal was already closed', function() {
                PortalMixins.closePortal();

                expect(this.portalNode).toBeUndefined();
                delete(this.portalNode);

                expect(function() {PortalMixins.closePortal();}).not.toThrow();
            });
        });
    });
});
