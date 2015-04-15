# Search Component

<img src="../src/js/examples/images/demo/search.gif" />

### Usage

```
url
    type: string
    required: true
    description: The endpoint to search against

isFullDataResponse
    type: boolean
    required: false
    default: false
    description: If true, will request the full result set to filter from on load. Otherwise, it will make requests for each key stroke

minLength
    type: number
    required: false
    default: 2
    description: The minimum length a search term must be before causing the item list to update
    
additionalFilters
    type: object
    required: false
    description: Sent on the data of the request to the server
    
searchFilterName
    type: string
    required: false
    description: Sent with the request to inform the server of what to search for
    
placeholder
    type: string
    required: false
    default: "Search"
    description: The text displayed in the search input when the field is empty
    
onDataReceived
    type: function
    required: false
    description: Callback function to be run when data comes back from the server successfully
    
onSelect
    type: function
    required: false
    description: Callback function to be run when an item is selected from the list
    
onInputSubmit
    type: function
    required: false
    description: Callback function to be run when the enter key is pressed
    
rowFormatter
    type: function
    required: false
    description: Callback function to be run when creating the list items to achieve a custom display
```

#### Example Usage

```javascript
var searchSubmitCallback = function(event) {
    var companyID = parseInt(event.target.getAttribute('data-id')),
        companyName = event.target.innerText;

    alert('You just clicked on ' + companyName + '. It\'s ID is ' + companyID);
};
```

```javascript
<Search url={'/test/search'} onSelect={searchSubmitCallback} isFullDataResponse={true} minLength={1}/>
```

### Example Data

```javascript
var searchData = [
    {"id": 10, "name": "Beazer Homes USA, Inc."},
    {"id": 16, "name": "Huntington Bancshares Inc."},
    {"id": 35, "name": "ExxonMobil Corporation"},
    {"id": 61, "name": "Pitney Bowes Inc."},
    {"id": 23, "name": "Xerox Corp"}
];
```
