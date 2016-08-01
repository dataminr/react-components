# Table Component

### Usage

```
componentId
    type: string
    required: true
    description: Used by the TableStore to keep track of Table state

key
    type: string
    required: true
    description: Used by React when there are more than one table displayed consecutively by a component

definition
    type: object
    required: true
    definition: This defines the look, feel, and display of the table

    url
        type: string
        required: true
        description: The endpoint for requesting data

    dataFormatter
        type: function
        required: false
        description: Will be called first whenever data is received from the server for custom post processing of data

    filters
        type: object
        required: false
        description: Sent as data with requests to the server

    advancedFilters
        type: array
        required: false
        description: Array of advanced filters that provide toggles to hide/show certain elements in the table results.

    pagination
        type: object
        required: false
        description: Enables Table pagination

        cursor
            type: number
            required: true
            description: The starting index of the table pagination (usually this is initially set to 0)

        size
            type: number
            required: true
            description: The number of elements to show within a paginated view of the table

    sortColIndex
        type: number
        required: false
        description: The default column to sort which requires sortDirection to be depicted in at least one object in definition.cols

    rowClick
        type: object
        required: false
        description: Enables row clicks on a Table

        callback
            type: function
            required: true
            description: A custom function to be called when a row is clicked

    selectedRowIndex
        type: number
        required: false
        description: Adds a row-selected class to the matching row index

    noResultsText
        type: string
        required: false
        default: "No results found."
        description: The text that will be displayed when there are no items in the table

    quickFilterPlaceholder
        type: string
        required: false
        default: "Filter"
        description: The placeholder text to display in the filter input field

    iconClasses
        type: object
        required: false
        default: {
            advancedFilterOn: 'fa fa-check-square-o',
            advancedFilterOff: 'fa fa-square-o',
            deselectAll: 'fa fa-minus-square-o',
            pageLeft: 'fa fa-chevron-left',
            pageRight: 'fa fa-chevron-right',
            rowsCollapsed: 'fa fa-chevron-right',
            rowsExpanded: 'fa fa-chevron-down',
            selectAll: 'fa fa fa-square-o',
            selectOn: 'fa fa-check-square-o',
            selectOff: 'fa fa-square-o',
            sortAsc: 'fa fa-sort-asc',
            sortDesc: 'fa fa-sort-desc',
            sortInactive: 'fa fa-sort',
            statusOn: 'fa fa-circle',
            statusOff: 'fa fa-circle-o'
        }
        description: Used to override default icons

    loadingIconClasses
        type: array|string
        required: false
        default: 'icon ion-loading-c'
        description: Used to override the loading icon

    cols
        type: array
        required: true
        description: An array of column definitions

        dataType
            type: string
            required: true
            description: one of ['string', 'number', 'percent', 'time', 'status', 'select', 'action', 'duration']

        dataProperty
            type: string
            required: true
            description: The property to use as the value from the data that came from the server

        headerLabel
            type: string
            required: false
            description: The label displayed in the header of the column

        onlineLimit
            type: number
            required: false
            description: Used with dataType of status to depict the time frame for the online indicator to display

        quickFilter
            type: boolean
            required: false
            description: Setting this to true will cause a quick filter input to display where users can client-side filter data.
            Searching in the form {header_name}:{search_term} will limit search results to just rows where the {header_name}
            column value exactly matches {search_term}

        sortDirection
            type: string
            required: false
            description: one of ['ascending', 'descending'] for the default sorting direction of a column

        timeFormat
            type: string
            required: false
            description: see [Momentjs](http://momentjs.com/docs/#/displaying/) used for dataTypes of time and status to display timestamps

        durationFormat
            type: string
            required: false
            description: Specifies the minimum time segment to display for the duration dataType. Valid options are 'days', 'hours', 'minutes', 'seconds', and 'milliseconds'. Default is 'minutes'. The value of a column of type duration is expected to be in milliseconds, similar to a timestamp. Any preceding zero time segments will not appear, e.g. '4h 0m 10s' will be displayed, not '0d 4h 0m 10s'. If all time segments to display are zero, then an empty string will display. For example, if durationFormat is 'minutes', then a value less than 60,000 (one minute) will be empty.

        width
            type: string
            required: false
            description: css width for the column

        onClick (only for action type columns)
            type: function
            required: true if column is of action type
            description: Action to invoke when clicking on an action cell. Callback will be invoked with click event, and data of full row clicked. Event propogation will automatically be stopped as to not invoke both cell and row click handlers, if present.

        markup (only for action type columns)
            type: object
            required: true if column is of action type
            description: Markup to display for action type column. Usually JSX for an icon.
```

#### Example Usage

```javascript
var tableDefinition = {
    url: '/test/table',
    cols: [
        {
            dataType: 'select',
            dataProperty: 'name',
            width: '35px'
        },
        {
            headerLabel: 'SPACECRAFT',
            dataProperty: 'spacecraft',
            sortDirection: 'ascending',
            dataType: 'string',
            width: '12%',
            quickFilter: true
        },
        {
            headerLabel: 'NAME',
            dataProperty: 'name',
            sortDirection: 'ascending',
            dataType: 'string',
            width: '12%',
            quickFilter: true
        },
        {
            headerLabel: 'MISSION',
            dataProperty: 'mission',
            sortDirection: 'ascending',
            dataType: 'string',
            width: '20%',
            quickFilter: true
        },
        {
            headerLabel: 'LAUNCHED',
            dataProperty: 'launched',
            sortDirection: 'descending',
            dataType: 'number',
            width: '12%',
            quickFilter: true
        },
        {
            headerLabel: 'LAST LAUNCH DATE',
            dataProperty: 'lastLaunchDate',
            sortDirection: 'descending',
            dataType: 'time',
            timeFormat: 'MMM Do YYYY',
            width: '20%',
            quickFilter: true
        },
        {
            headerLabel: 'LAST COMMUNICATION',
            dataProperty: 'lastCommunication',
            sortDirection: 'descending',
            dataType: 'status',
            onlineLimit: 4,
            timeFormat: 'MMM Do, h:mm A YYYY',
            width: '15%',
            quickFilter: true
        },
        {
            headerLabel: "REMOVE",
            dataType: 'action',
            markup: <i className="fa fa-times-circle"/>,
            width: '5%',
            onClick: function(evt, rowData){
                alert('You clicked remove action for this row: ' + rowData.name);
            }
        }
    ],
    advancedFilters: [
        {
            dataProperty: 'archived', //Name of the property that will determine whether column is visible or not
            filterValue: true, //Value to check against when checkbox is selected. In this example, if the row "archived" property is true, it will show when the checkbox is selected, otherwise it will be hidden
            label: 'Show Archived' //Label to display next to checkbox
        }
    ],
    sortColIndex: 1,
    pagination: {
        cursor: 0,
        size: 5
    },
    rowClick: {
        callback: function(event, props, state, rowIndex) {
            alert(
                'You just clicked on ' + state.data[rowIndex][state.rowClick.labelKey || 'name'] + '.' +
                'We just executed the user defined rowClick.callback:\n\n' +
                'callback: function(event, props, state, rowIndex) {\n' +
                '    alert(\'You just clicked on +\'\n    state.data[rowIndex][state.rowClick.labelKey \n    || \'name\'] + \'.\');\n' +
                '}'
            );
        }
    }
};
```

```javascript
var Table = require('dataminr-react-components/dist/table/Table')

<Table definition={tableDefinition}
                   componentId='tableId'
                   key='tableId'
                   loadingIconClasses={['icon', 'ion-loading-c']}
                   quickFilterPlaceholder='Quick Filter' />
```

#### Example Data

```javascript
var testTableData = [
    {"spacecraft": "Amos", "name": "Amos", "mission": 'Communications sat, Israel', "launched": 5, "lastLaunchDate": 832204800000, "lastCommunication": Moment().subtract(3, 'minutes').valueOf()},
    {"spacecraft": "Hipparcos", "name": "Hipparcos", "mission": 'Astrometry (ESA)', "launched": 1, "lastLaunchDate": 618537600000, "lastCommunication": Moment().subtract(4, 'minutes').valueOf()},
    {"spacecraft": "Universitetskiy", "name": "Tatyana", "mission": 'Student satellite, Russia', "launched": 1, "lastLaunchDate": 1253145600000, "lastCommunication": Moment().subtract(1, 'minutes').valueOf()},
    {"spacecraft": "ISS", "name": "Aryabhata", "mission": 'Test satellite (India)', "launched": 1, "lastLaunchDate": 167097600000, "lastCommunication": 167529600000},
    {"spacecraft": "SEO", "name": "Bhaskara", "mission": 'Earth observing sat (India)', "launched": 1, "lastLaunchDate": 297561600000, "lastCommunication": 624585602301},
    {"spacecraft": "STARS-2", "name": "Kukai", "mission": 'Tether experiment', "launched": 2, "lastLaunchDate": 1393459200000, "lastCommunication": Moment().subtract(2, 'minutes').valueOf()},
    {"spacecraft": "Sina", "name": "Sina(h)-1", "mission": 'Test satellite', "launched": 1, "lastLaunchDate": 1130371200000, "lastCommunication": 1145577603301},
    {"spacecraft": "Ghauri", "name": "Ghauri", "mission": 'Missile', "launched": 2, "lastLaunchDate": 924048000000},
    {"spacecraft": "Marcopolo", "name": "Marcopolo", "mission": 'Communications sat, England', "launched": 2, "lastLaunchDate": 650937600000, "lastCommunication": 104353920521},
    {"spacecraft": "Giotto", "name": "Giotto", "mission": 'Comet probe (ESA)', "launched": 1, "lastLaunchDate": 489110400000, "lastCommunication": 711849600040},
    {"spacecraft": "MPLM-3", "name": "Donatello", "mission": 'Space station module, not flown', "launched": 0},
    {"spacecraft": "XMM", "name": "XMM-Newton", "mission": 'X-ray astronomy', "launched": 1, "lastLaunchDate": 962409610000, "lastCommunication": Moment().subtract(1, 'second').valueOf()},
];
```
