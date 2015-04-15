define(function(require) {
    'use strict';

    var Modal = require('drc/modal/Modal');
    var React = require('react');
    var TestUtils = React.addons.TestUtils;

    describe('Modal', function() {
        var node, modal;
        var props = {
            title: 'Modal Title',
            closeModalCallback: function() {}
        };

        beforeEach(function() {
            node = document.createElement('div');
            document.body.appendChild(node);

            modal = React.render(<Modal {...props}><span id="text">Text</span></Modal>, node);
        });

        afterEach(function() {
            React.unmountComponentAtNode(node);
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

        describe('keyDownHandler function', function() {
            it('should close the modal if the escape key is pressed', function() {
                spyOn(modal.props, 'closeModalCallback');
                TestUtils.Simulate.keyDown(document.activeElement, {keyCode: 27});

                expect(modal.props.closeModalCallback.calls.count()).toEqual(1);

                // Shouldn't trigger close when the enter key is pressed.
                TestUtils.Simulate.keyDown(document.activeElement, {keyCode: 13});

                expect(modal.props.closeModalCallback.calls.count()).toEqual(1);
            });
        });

        describe('backgroundClickHandler function', function() {
            it('should close the modal when clicked', function() {
                spyOn(modal.props, 'closeModalCallback');
                TestUtils.Simulate.click(document.getElementById('modal-container'), {});

                expect(modal.props.closeModalCallback.calls.count()).toEqual(1);

                // Shouldn't trigger close if the click catcher wasn't clicked.
                modal.backgroundClickHandler({target: {getAttribute: function() {return null;}}});

                expect(modal.props.closeModalCallback.calls.count()).toEqual(1);
            });
        });

        describe('closeModalHandler function', function() {
            it('should be triggered by clicking on the close modal button', function() {
                spyOn(modal.props, 'closeModalCallback').and.callThrough();
                TestUtils.Simulate.click(document.getElementsByClassName('fa-close')[0], {});

                expect(modal.props.closeModalCallback.calls.count()).toEqual(1);
            });

            it('should stop event propagation', function() {
                var e = {stopPropagation: function() {}};
                spyOn(e, 'stopPropagation');
                modal.closeModalHandler(e);

                expect(e.stopPropagation.calls.count()).toEqual(1);
            });

            it('should trigger the closeModalCallback if it was passed in on props', function() {
                var e = {stopPropagation: function() {}};
                spyOn(modal.props, 'closeModalCallback');
                modal.closeModalHandler(e);

                expect(modal.props.closeModalCallback.calls.count()).toEqual(1);
            });

            it('should unmount the modal if the closeModalCallback was not passed in on props', function() {
                var e = {stopPropagation: function() {}};

                React.unmountComponentAtNode(node);
                modal = React.render(<Modal title='Modal Title'><span id="text">Text</span></Modal>, node);
                spyOn(React, 'unmountComponentAtNode').and.callThrough();
                modal.closeModalHandler(e);

                expect(React.unmountComponentAtNode.calls.count()).toEqual(1);
            });
        });
    });
});
