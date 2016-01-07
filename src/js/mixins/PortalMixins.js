var ReactDOM = require('react-dom');

module.exports = {
    /**
     * Creates a new detatched DOM node to render child components within.
     * @param {Object} children - The items to be displayed in the portal.
     */
    openPortal: function(children) {
        this.portalNode = document.createElement('div');
        document.body.appendChild(this.portalNode);
        ReactDOM.render(children, this.portalNode);
    },

    /**
     * When passed a string, a confirmation dialog will show with the string before the dialog is about to close.
     * Provides a way to make the user confirm that they want to close the modal.
     * @param {String|Null} message - The text to display in the confirm dialog or null to clear.
     */
    setPortalConfirmOnClose: function(message) {
        this.portalConfirmOnCloseMessage = message;
    },

    /**
     * Unmounts the components rendered in the portal and removes the associated DOM node.
     */
    closePortal: function() {
        /* eslint-disable no-alert */
        var close = typeof this.portalConfirmOnCloseMessage === 'string' ? confirm(this.portalConfirmOnCloseMessage) : true;
        /* eslint-enable no-alert */

        if (this.portalNode && this.portalNode.parentNode && close) {
            ReactDOM.unmountComponentAtNode(this.portalNode);
            this.portalNode.parentNode.removeChild(this.portalNode);
            this.portalNode = null;
        }
    }
};
