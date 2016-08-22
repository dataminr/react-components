# PageMessage Component

### Usage

##### This component is not meant to be used directly. This leverages the portalMixins and is accessed by using the pageMessage utility function.

```
message
    type: string
    required: true
    description: The message to be displayed.

type
    type: string
    required: true
    description: The type of message (success, error, warning, info, or some custom type).

options
    type: object
    required: false
    definition: Configuration overrides for icon, closeIcon, and duration.

    icon
        type: string
        required: false
        description: The icon to display next to the message.

    closeIcon
        type: string
        required: false
        description: The icon used to dismiss the message.

    duration
        type: number
        required: false
        description: How long the message will be displayed before automatically dismissing itself. Set to 0 to force user to dismiss manually.
        default: 3000

    disableTransition
        type: boolean
        required: false
        description: Whether to show a transition when the message appears and disappears.
```

#### Example Usage

```javascript
var Utils = require('dataminr-react-components/dist/utils/Utils');

Utils.pageMessage(message, 'success');
Utils.pageMessage(message, 'error');
Utils.pageMessage(message, 'warning');
Utils.pageMessage(message, 'info');
Utils.pageMessage(message, 'custom', {icon: 'fa fa-star' closeIcon: 'fa fa-times-circle', duration: 10000});
```
