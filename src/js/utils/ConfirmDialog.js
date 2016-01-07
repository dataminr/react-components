var PortalMixins = require('../mixins/PortalMixins');
var React = require('react');
var _ = require('lodash');

var ConfirmDialog = React.createClass({
    propTypes: {
        message: React.PropTypes.string,
        okButtonText: React.PropTypes.string,
        cancelButtonText: React.PropTypes.string,
        okButtonClickHandler: React.PropTypes.func,
        cancelButtonClickHandler: React.PropTypes.func,
        okIconClasses: React.PropTypes.string,
        cancelIconClasses: React.PropTypes.string
    },

    getDefaultProps: function() {
        return {
            okButtonText: 'OK',
            cancelButtonText: 'Cancel',
            okButtonClickHandler: function(){},
            cancelButtonClickHandler: function(){},
            okIconClasses: 'okButton fa fa-check',
            cancelIconClasses: 'cancelButton fa fa-ban'
        };
    },

    /**
     * Closes the portal, but using async defer to delay the unmounting that happens. It does
     * this because of this bug - https://github.com/facebook/react/issues/3298
     */
    closePortal: function(){
        _.defer(function(){
            PortalMixins.closePortal();
        });
    },

    /**
     * Handler for when OK button is clicked. Invokes the handler prop and if it doesn't
     * return false, closes the portal.
     */
    handleOkClick: function(){
        if(this.props.okButtonClickHandler() !== false){
            this.closePortal();
        }
    },

    /**
     * Handler for when cancel button is clicked. Invokes the handler prop and if it doesn't
     * return false, closes the portal.
     */
    handleCancelClick: function(){
        if(this.props.cancelButtonClickHandler() !== false){
            this.closePortal();
        }
    },

    /**
     * Gets markup for inner content of OK button with optional icon and
     * button text.
     * @param  {String} icon Classes for icon. No icon will be added if not set
     * @param  {String} text Text label for button
     * @return {Array}       Markup for button content
     */
    getButtonText: function(icon, text){
        var markup = [];
        if(icon){
            markup.push(<i className={icon} key="icon"/>);
        }
        markup.push(<span key="label">{text}</span>);
        return markup;
    },

    render: function() {
        return (
            <div className="confirm-dialog">
                <div className="message">
                    {this.props.message}
                </div>
                <div className="confirm-buttons">
                    <button className="button" onClick={this.handleOkClick}>{this.getButtonText(this.props.okIconClasses, this.props.okButtonText)}</button>
                    <button className="button" onClick={this.handleCancelClick}>{this.getButtonText(this.props.cancelIconClasses, this.props.cancelButtonText)}</button>
                </div>
            </div>
        );
    }
});

module.exports = ConfirmDialog;
