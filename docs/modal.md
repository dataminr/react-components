# Modal Component

### Usage

```
title
    type: string
    required: false
    description: The text that will be displayed as the modal header
    
closeModalCallback
    type: function
    required: false
    description: Triggered when the modal is closed by clicking on the close button or pressing escape
        
backgroundClickToClose
    type: boolean
    required: false
    default: true
    description: Used to control whether or not a click outside the modal will cause it to close

showCloseIcon
    type: boolean  
    required: false
    default: true
    description: Used to control whether the modal should show a close text and icon in the top right. Also disables using the escape key to close the modal.

iconClasses
    type: object
    required: false
    default: {
        close: 'fa fa-close'
    }
    description: Used to override default icons
```

#### Example Usage

```javascript
var Modal = require('drc/modal/Modal');
var PortalMixins = require('drc/mixins/PortalMixins');

return React.createClass({
    displayName: 'App',
    mixins: [PortalMixins],
    // ...
    
    render: function() {
        // ...
        <input type="button" className="modal-button" onClick={this.openModal} value="Open Modal" />
        // ...
        
    },
    
    openModal: function() {
        this.openPortal(
            <Modal title="Modal Title" closeModalCallback={this.closePortal}>
                Paleo hella meditation Thundercats. Artisan Wes Anderson plaid, meggings trust fund sartorial
                slow-carb flexitarian direct trade skateboard. Gentrify sriracha Kickstarter Godard butcher
                McSweeneys. Etsy keffiyeh hoodie irony vinyl. Ugh VHS hella, mlkshk craft beer meh banh mi.
                Whatever normcore Truffaut sustainable lo-fi literally, Vice leggings XOXO. Wayfarers Austin
                tattooed mlkshk asymmetrical plaid butcher, chia stumptown post-ironic.
            </Modal>
        );
    }
});
```
