var Modal = require('../Modal');
var React = require('react');
var ReactDOM = require('react-dom');
var TestUtils = require('react-addons-test-utils');

describe('Modal', function() {
    var node, modal, props;

    beforeEach(function() {
        props = {
            title: 'Modal Title',
            closeModalCallback: jasmine.createSpy('closeModalCallback')
        };
        node = document.createElement('div');
        document.body.appendChild(node);

        modal = ReactDOM.render(<Modal {...props}><span id="text">Text</span></Modal>, node);
    });

    afterEach(function() {
        ReactDOM.unmountComponentAtNode(node);
    });

    describe('getInitialState function', function() {
        it('should set the component\'s icon classes to the default icon classes', function() {
            expect(modal.iconClasses).toEqual({close: 'fa fa-close'});
        });

        it('should set the component\'s icon classes to icon classes passed in on props', function() {
            var props = {
                title: 'Modal Title',
                closeModalCallback: function() {},
                iconClasses: {close: 'test-class'}
            };
            modal = TestUtils.renderIntoDocument(<Modal {...props}>Child</Modal>);

            expect(modal.iconClasses).toEqual({close: 'test-class'});
        });
    });

    describe('componentDidMount and componentDidUpdate function', function() {
        it('should render the children and focus the modal', function() {
            var contentElement = document.getElementsByClassName('content')[0];
            expect(contentElement).toBe(document.activeElement);

            spyOn(contentElement, 'focus');
            modal.componentDidUpdate();
            expect(contentElement.focus.calls.count()).toEqual(1);

            expect(document.getElementById('text').innerText).toEqual('Text');
        });
    });

    describe('getCloseIconMarkup', function(){
        it('returns null when not showing icon', function(){
            modal = ReactDOM.render(<Modal {...props} showCloseIcon={false}><span id="text">Text</span></Modal>, node);

            expect(modal.getCloseIconMarkup()).toBeNull();
        });

        it('returns ReactElement for close content', function(){
            modal = ReactDOM.render(<Modal {...props}><span id="text">Text</span></Modal>, node);

            expect(modal.getCloseIconMarkup()).toBeObject();
        });
    });

    describe('keyDownHandler function', function() {
        it('should close the modal if the escape key is pressed', function() {
            TestUtils.Simulate.keyDown(document.activeElement, {keyCode: 27});

            expect(props.closeModalCallback.calls.count()).toEqual(1);

            // Shouldn't trigger close when the enter key is pressed.
            TestUtils.Simulate.keyDown(document.activeElement, {keyCode: 13});

            expect(props.closeModalCallback.calls.count()).toEqual(1);
        });

        it('should do nothing if not showing close icon', function(){
            modal = ReactDOM.render(<Modal {...props} showCloseIcon={false}><span id="text">Text</span></Modal>, node);

            TestUtils.Simulate.keyDown(document.activeElement, {keyCode: 27});

            expect(props.closeModalCallback).not.toHaveBeenCalled();
        });
    });

    describe('backgroundClickHandler function', function() {
        it('should close the modal when clicked', function() {
            TestUtils.Simulate.click(document.getElementById('modal-container'), {});

            expect(props.closeModalCallback.calls.count()).toEqual(1);

            // Shouldn't trigger close if the click catcher wasn't clicked.
            modal.backgroundClickHandler({target: {getAttribute: function() {return null;}}});

            expect(props.closeModalCallback.calls.count()).toEqual(1);
        });

        it('should not close the modal if backgroundClickToClose was set to false on props', function() {
            modal = ReactDOM.render(<Modal {...props} backgroundClickToClose={false}><span id="text">Text</span></Modal>, node);
            TestUtils.Simulate.click(document.getElementById('modal-container'), {});

            expect(props.closeModalCallback).not.toHaveBeenCalled();
        });
    });

    describe('closeModalHandler function', function() {
        it('should be triggered by clicking on the close modal button', function() {
            props.closeModalCallback.and.callThrough();
            TestUtils.Simulate.click(document.getElementsByClassName('fa-close')[0], {});

            expect(props.closeModalCallback.calls.count()).toEqual(1);
        });

        it('should stop event propagation', function() {
            var e = {stopPropagation: function() {}};
            spyOn(e, 'stopPropagation');
            modal.closeModalHandler(e);

            expect(e.stopPropagation.calls.count()).toEqual(1);
        });

        it('should trigger the closeModalCallback if it was passed in on props', function() {
            var e = {stopPropagation: function() {}};
            modal.closeModalHandler(e);

            expect(modal.props.closeModalCallback.calls.count()).toEqual(1);
        });

        it('should unmount the modal if the closeModalCallback was not passed in on props', function() {
            var e = {stopPropagation: function() {}};

            //ReactDOM.unmountComponentAtNode(node);
            modal = ReactDOM.render(<Modal title='Modal Title'><span id="text">Text</span></Modal>, node);
            spyOn(ReactDOM, 'unmountComponentAtNode');
            modal.closeModalHandler(e);

            expect(ReactDOM.unmountComponentAtNode.calls.count()).toEqual(1);
        });
    });
});
