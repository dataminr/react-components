var createReactClass = require('create-react-class');
var PropTypes = require('prop-types');
var React = require('react');
var ReactDOM = require('react-dom');
var _ = require('lodash');

var iconClasses = {
    close: 'fa fa-close'
};

module.exports = createReactClass({
    displayName: 'Modal',

    propTypes: {
        autoFocusModal: PropTypes.bool,
        closeModalCallback: PropTypes.func,
        backgroundClickToClose: PropTypes.bool,
        footerButtonCallback: function(props) {
            if(props.footerButtonCallback && (typeof props.footerButtonCallback !== 'function' || !props.footerButtonText)) {
                return new Error('footerButtonCallback must be a function if included, and footerButtonText must be used with it.');
            }
        },
        footerButtonText: function(props) {
            if (props.footerButtonText && (typeof props.footerButtonText !== 'string' || !props.footerButtonCallback)) {
                return new Error('footerButtonText must be a string if included, and footerButtonCallback must be used with it.');
            }
        },
        iconClasses: PropTypes.object,
        showCloseIcon: PropTypes.bool,
        title: PropTypes.string
    },

    getDefaultProps: function() {
        return {
            autoFocusModal: true,
            backgroundClickToClose: true,
            showCloseIcon: true
        };
    },

    getInitialState: function() {
        this.iconClasses = _.merge(_.clone(iconClasses), this.props.iconClasses);

        return {};
    },

    componentDidMount: function() {
        if(this.props.autoFocusModal) {
            this.refs.content.focus();
        }
    },

    componentDidUpdate: function() {
        if(this.props.autoFocusModal) {
            this.refs.content.focus();
        }
    },

    /**
     * Gets markup to display close icon in upper right corner. Only returns markup if
     * the showCloseIcon prop is set.
     * @return {null|ReactElement} Icon markup or null
     */
    getCloseIconMarkup: function(){
        if(!this.props.showCloseIcon){
            return null;
        }
        return (
            <span className="close" onClick={this.closeModalHandler}>
                <span className="close-text">esc to close</span> | <i className={this.iconClasses.close} />
            </span>
        );
    },

    /**
     * Returns the markup for the footer containing a button if the footerButtonText was passed in on props.
     * @return {null|ReactElement} Footer markup
     */
    getFooter(){
        if(!this.props.footerButtonText) {
            return null;
        }
        return (
            <div className="footer" >
                <button onClick={this.props.footerButtonCallback}>{this.props.footerButtonText}</button>
            </div>
        );
    },

    render: function() {
        return (
            <div onClick={this.backgroundClickHandler} id="modal-container" data-clickcatcher="true">
                <div ref="content" className="content" tabIndex="-1" onKeyDown={this.keyDownHandler}>
                    <div className="header">
                        <span className="title">{this.props.title}</span>
                        {this.getCloseIconMarkup()}
                    </div>
                    <div className="body">
                        {this.props.children}
                    </div>
                    {this.getFooter()}
                </div>
            </div>
        );
    },

    /**
     * If the key pressed is the escape key and the close icon is being shown, the close modal handler will be called.
     * @param {object} e - The simulated React event.
     */
    keyDownHandler: function(e) {
        // escape key pressed
        if (e.keyCode === 27 && this.props.showCloseIcon) {
            this.closeModalHandler(e);
        }
    },

    /**
     * Captures any click event outside the modal and calls the close modal handler.
     * @param {Object} e - The simulated React event.
     */
    backgroundClickHandler: function(e) {
        if (this.props.backgroundClickToClose && e.target.getAttribute('data-clickcatcher')) {
            this.closeModalHandler(e);
        }
    },

    /**
     * Triggered when clicking outside the modal, clicking on the close button, and when pressing escape.
     * @param {Object} e - The simulated React event.
     */
    closeModalHandler: function(e) {
        e.stopPropagation();

        if (typeof this.props.closeModalCallback === 'function') {
            this.props.closeModalCallback();
        }
        else {
            ReactDOM.unmountComponentAtNode(this.parentNode);
        }
    }
});
