define(function(require) {
    'use strict';

    var React = require('react');

    return {
        /**
         * Creates a new detatched DOM node to render child components within.
         * @param {Object} children - The items to be displayed in the portal.
         */
        openPortal: function(children) {
            this.portalNode = document.createElement('div');
            document.body.appendChild(this.portalNode);
            React.render(children, this.portalNode);
        },

        /**
         * Unmounts the components rendered in the portal and removes the associated DOM node.
         */
        closePortal: function() {
            if (this.portalNode && this.portalNode.parentNode) {
                React.unmountComponentAtNode(this.portalNode);
                this.portalNode.parentNode.removeChild(this.portalNode);
                this.portalNode = null;
            }
        }
    };
});
