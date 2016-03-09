# ConfirmDialog Component

### Usage

##### This component is not meant to be used directly. This leverages the portalMixins and is accessed by using the confirmDialog utility function.

```
title
    type: string
    required: false
    description: The title to display in the modal dialog
    
subTitle
    type: string
    required: false
    description: The subtitle to display within the dialog

okHandler
    type: function
    required: false
    description: Function handler to call when ok button is clicked. After this function is run the dialog will automatically be closed unless this method explicitly returns false.

cancelHandler
    type: function
    required: false
    description: Function handler to call when cancel button is clicked. After this function is run the dialog will automatically be closed unless this method explicitly returns false.
    
options
    type: object
    required: false
    definition: Configuration overrides for button icons and labels.
    
    okButtonText
        type: string
        default: 'OK'
        description: The label to display for the OK button

    cancelButtonText
        type: string
        default: 'Cancel'
        description: The label to display for the cancel button

    okIconClasses
        type: string
        default: 'okButton fa fa-check'
        description: The class names to use for the OK button icon. Set to null to remove icon.

    cancelIconClasses
        type: string
        default: 'cancelButton fa fa-ban'
        description: The class names to use for the cancel button icon. Set to null to remove icon.
```

#### Example Usage

```javascript
var Utils = require('dataminr-react-components/dist/utils/Utils');

Utils.confirmDialog('Confirm Delete', 'Are you sure you want to delete this?', function(){
    //handle OK Click
});

Utils.confirmDialog('Are you sure you want to delete this?', null, function(){
    //handle OK Click
}, function(){
    //handle cancel Click
});

Utils.confirmDialog('Are you sure you want to delete this?', null, function(){
    //handle OK Click
}, function(){
    //handle cancel Click
}, {
    okButtonText: 'Confirm',
    cancelButtonText: 'Nope',
    okIconClasses: 'okButton fa fa-check-circle',
    cancelIconClasses: null //Clear cancel icon
});
```
