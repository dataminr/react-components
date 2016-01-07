var Modal = require('../src/js/modal/Modal');
var PieChart = require('../src/js/pie-chart/PieChart');
var PortalMixins = require('../src/js/mixins/PortalMixins');
var React = require('react');
var Search = require('../src/js/search/Search');
var Table = require('../src/js/table/Table');
var TableStore = require('../src/js/table/TableStore');
var Utils = require('../src/js/utils/Utils');

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
            width: '20%',
            quickFilter: true
        }
    ],
    advancedFilters: [
        {
            dataProperty: 'archived',
            filterValue: true,
            label: 'Show Archived'
        },
        {
            dataProperty: 'deleted',
            filterValue: true,
            label: 'Show Deleted'
        }
    ],
    sortColIndex: 1,
    pagination: {
        cursor: 0,
        size: 5
    },
    rowClick: {
        callback: function(event, props, state) {
            var idx = event.currentTarget.rowIndex;
            /* eslint-disable no-alert */
            alert(
                'You just clicked on ' + state.data[idx][state.rowClick.labelKey || 'name'] + '.' +
                'We just executed the user defined rowClick.callback:\n\n' +
                'callback: function(event, props, state) {\n' +
                '    var idx = event.currentTarget.rowIndex;\n' +
                '    alert(\'You just clicked on +\'\n    state.data[idx][state.rowClick.labelKey \n    || \'name\'] + \'.\');\n' +
                '}'
            );
            /* eslint-enable no-alert */
        }
    }
};

var pieChartDefinition = {
    url: '/test/piechart',
    label: 'BROWSERS'
};

var searchSubmitCallback = function(event) {
    var companyID = parseInt(event.target.getAttribute('data-id')),
        companyName = event.target.innerText;

    /* eslint-disable no-alert */
    alert('You just clicked on ' + companyName + '. It\'s ID is ' + companyID);
    /* eslint-enable no-alert */
};

module.exports = React.createClass({
    displayName: 'App',

    mixins: [PortalMixins],

    getInitialState: function() {
        return {
            selectedComponentSet: window.location.hash.split('#')[1] || 'piechart'
        };
    },

    componentDidUpdate: function() {
        window.location.hash = this.state.selectedComponentSet;
    },

    render: function() {
        var componentSet;

        switch (this.state.selectedComponentSet) {
            case 'modal':
                componentSet = (
                    <div className="component modal">
                        <button type="button" onClick={this.openModal}>Open Modal</button>
                    </div>
                );
                break;
            case 'confirmDialog':
                componentSet = (
                    <div className="component modal">
                        <button type="button" onClick={this.showConfirmDialog}>Confirm Dialog</button>
                    </div>
                );
                break;
            case 'pageMessage':
                componentSet = (
                    <div className="component">
                        <button type="button" onClick={this.handleMessageClick.bind(this, 'Success')}>Success</button>
                        <button type="button" onClick={this.handleMessageClick.bind(this, 'Error')}>Error</button>
                        <button type="button" onClick={this.handleMessageClick.bind(this, 'Warning')}>Warning</button>
                        <button type="button" onClick={this.handleMessageClick.bind(this, 'Info')}>Info</button>
                        <button type="button" onClick={this.handleMessageClick.bind(this, 'Lorem ipsum dolor sit amet, ' +
                            'consectetur adipiscing elit. Sed condimentum quis velit eget varius. Cras a risus tortor. ' +
                            'Praesent sed ante dui. Nullam iaculis laoreet nulla, sit amet fringilla ante mattis quis. ' +
                            'Nullam id augue eu urna ornare tincidunt. Vestibulum venenatis nibh a mi fringilla egestas. ' +
                            'Duis eget elementum elit.')}>Custom</button>
                    </div>
                );
                break;
            case 'piechart':
                componentSet = (
                    <div className="component">
                        <PieChart definition={pieChartDefinition}
                                  componentId={'pieChartId'}
                                  key={'pieChartId'}
                                  loadingIconClasses={['icon', 'ion-loading-c']} />
                    </div>
                );
                break;
            case 'search':
                componentSet = (
                    <Search url={'/test/search'} onSelect={searchSubmitCallback} isFullDataResponse={true} minLength={1}/>
                );
                break;
            case 'table':
                componentSet = (
                    <div className="component">
                        <div className="bulk-action-button" onClick={this.handleBulkActionClick}>Bulk Action</div>
                        <Table definition={tableDefinition}
                               componentId='tableId'
                               key='tableId'
                               loadingIconClasses={['icon', 'ion-loading-c']}
                               quickFilterPlaceholder='Quick Filter' />
                    </div>
                );
                break;
        }

        return (
            <div className="app-component">
                <div id="header-component">
                    <img id="application-logo" src="images/dataminr_logo_white-01.png" />
                    <div className="header-divider"></div>
                    <div className="application-description">
                        <a href="http://facebook.github.io/react/" target="_blank" className="react"><img src="images/react_logo.png" /><span>React Components</span></a>
                        <a href="https://facebook.github.io/flux/" target="_blank" className="flux"><img src="images/flux_logo.svg" /><span>Flux Architecture</span></a>
                    </div>
                </div>
                <div className="sidebar">
                    <ul className="nav no-select">
                        <li className={this.state.selectedComponentSet === 'modal' ? 'active' : null}
                            onClick={this.handleLinkClick.bind(this, 'modal')}>Modal</li>
                        <li className={this.state.selectedComponentSet === 'confirmDialog' ? 'active' : null}
                            onClick={this.handleLinkClick.bind(this, 'confirmDialog')}>Confirm Dialog</li>
                        <li className={this.state.selectedComponentSet === 'pageMessage' ? 'active' : null}
                            onClick={this.handleLinkClick.bind(this, 'pageMessage')}>Page Message</li>
                        <li className={this.state.selectedComponentSet === 'piechart' ? 'active' : null}
                            onClick={this.handleLinkClick.bind(this, 'piechart')}>Pie Chart</li>
                        <li className={this.state.selectedComponentSet === 'search' ? 'active' : null}
                            onClick={this.handleLinkClick.bind(this, 'search')}>Search</li>
                        <li className={this.state.selectedComponentSet === 'table' ? 'active' : null}
                            onClick={this.handleLinkClick.bind(this, 'table')}>Table</li>
                    </ul>
                </div>
                <div className="content-component">
                    {componentSet}
                </div>
            </div>
        );
    },

    openModal: function() {
        this.openPortal(
            <Modal title="Modal Title" closeModalCallback={this.closePortal}>
                Paleo hella meditation Thundercats. Artisan Wes Anderson plaid, meggings trust fund sartorial
                slow-carb flexitarian direct trade skateboard. Gentrify sriracha Kickstarter Godard butcher
                McSweeney's. Etsy keffiyeh hoodie irony vinyl. Ugh VHS hella, mlkshk craft beer meh banh mi.
                Whatever normcore Truffaut sustainable lo-fi literally, Vice leggings XOXO. Wayfarers Austin
                tattooed mlkshk asymmetrical plaid butcher, chia stumptown post-ironic.
            </Modal>
        );
    },

    showConfirmDialog: function(){
        Utils.confirmDialog('Confirm Delete', 'Are you sure you want to delete this?');
    },

    handleBulkActionClick: function() {
        /* eslint-disable no-alert */
        alert('You have selected the following items from the table:\n\n' + TableStore.getSelectedItems('tableId'));
        /* eslint-enable no-alert */
    },

    handleLinkClick: function(link) {
        this.setState({
            selectedComponentSet: link
        });
    },

    handleMessageClick: function(message) {
        switch(message) {
            case 'Success':
            case 'Error':
            case 'Warning':
            case 'Info':
                Utils.pageMessage(message, message.toLowerCase());
                break;
            default:
                Utils.pageMessage(message, 'custom', {icon: 'fa fa-star', closeIcon: 'fa fa-times-circle', duration: 10000});
                break;
        }
    }
});
