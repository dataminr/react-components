var createReactClass = require('create-react-class');
var _ = require('lodash');
var PropTypes = require('prop-types');
var React = require('react');
var RequestHandler = require('RequestHandler').default;
var Utils = require('../utils/Utils');

var Search = createReactClass({
    displayName: 'Search',

    /**
     * Prop validation
     * @type {Object}
     */
    propTypes: {
        url: PropTypes.string.isRequired,
        isFullDataResponse: PropTypes.bool,
        minLength: PropTypes.number,
        additionalFilters: PropTypes.object,
        searchFilterName: PropTypes.string,
        placeholder: PropTypes.string,
        onDataReceived: PropTypes.func,
        onSelect: PropTypes.func,
        onInputSubmit: PropTypes.func,
        rowFormatter: PropTypes.func
    },

    /**
     * Index of focused item in dropdown list
     * @type {Number}
     */
    focusedIndex: null,

    /**
     * Denotes if user action (up/down arrows) occurred over the dropdown list
     * @type {Boolean}
     */
    actionOverList: false,

    /**
     * List of current filtered items. Mainly used when this.props.isFullDataResponse is true
     * @type {Array}
     */
    currentFilteredList: [],

    /**
     * Key for existing outstanding ajax request when searching against an endpoint. We
     * keep track of this so that we can abort() it when another request comes in.
     * @type {Object}
     */
    outstandingRequest: null,

    /**
     * Map of keycodes to handler functions when focused on a autocomplete item
     * @type {Object}
     */
    listKeyCodeHandlers: {
        38: 'focusPrev',        //Up arrow
        40: 'focusNext',        //Down arrow
        27: 'clearList',        //Esc
        13: 'selectItemOnEnter' //Enter
    },

    /**
     * Object to store response data when isFullDataResponse is false. Halts outgoing
     * requests for previously views search terms.
     * @type {Object}
     */
    cache: {},

    /**
     * Sets default props for search component
     * @return {Object} Default props
     */
    getDefaultProps: function(){
        return {
            isFullDataResponse: false,
            minLength: 2,
            placeholder: 'Search'
        };
    },

    getInitialState: function() {
        return {
            disabled: this.props.isFullDataResponse,
            itemList: [],
            shownList: [],
            inputValue: '',
            inputFocused: false
        };
    },

    /**
     * When the list goes from not shown to shown, add a click listener to close the list if a user
     * clicks of the list. If the list is going from shown to hidden, remove the listener.
     * @param  {Object} prevProps Props before update
     * @param  {Object} prevState State before update
     */
    componentDidUpdate: function(prevProps, prevState){
        if(!prevState.shownList.length && this.state.shownList.length && !this.eventListener){
            this.eventListener = _.bind(function(e){
                var container = this.refs.searchContainer;
                if(e.target !== container && !_.includes(container, e.target)){
                    this.hideList();
                }
            }, this);
            document.addEventListener('click', this.eventListener);
        }
        if(this.eventListener && prevState.shownList.length && !this.state.shownList.length){
            document.removeEventListener('click', this.eventListener);
        }
    },

    /**
     * Removes event listener when component unmounts
     */
    componentWillUnmount() {
        if(this.eventListener) {
            document.removeEventListener('click', this.eventListener);
        }
    },

    /**
     * Subscribe to specific change event and fire off a data request to do initial
     * data population
     */
    componentDidMount: function(){
        if(this.props.isFullDataResponse){
            this.requestFullData();
        }
    },

    /**
     * Makes a request on load to request full data set of this.props.isFullDataResponse is set. Once done, invokes
     * onDataReceived method with results.
     */
    requestFullData: function(){
        RequestHandler.request(this.props.url, this.props.additionalFilters, this.onDataReceived, this.onError, this);
    },

    /**
     * Makes a request for the provided search term. Used when each character typed will cause a request
     * to be made for data.
     * @param {String} searchTerm Term searched on
     */
    requestDataForTerm: function(searchTerm){
        //Cancel any existing requests
        if(this.outstandingRequest && this.outstandingRequest.abort){
            this.outstandingRequest.abort();
        }

        var cachedData = this.cache[this.getSearchTermCacheKey(searchTerm)];
        if(cachedData){
            this.updateStateForNewData(cachedData);
        }
        else {
            this.outstandingRequest = RequestHandler.request(
                this.props.url,
                this.getSearchFilters(searchTerm),
                function(data) {return this.onDataReceived(data, searchTerm);},
                this.onError,
                this
            );
        }
    },

    /**
     * Error handler for failed request. Updates failure message and sets input to be disabled if full
     * data response prop is set. Otherwise does nothing and essentially just disables autocomplete.
     */
    onError: function(){
        if(this.props.isFullDataResponse){
            this.setState({placeholder: 'Unable to load list', disabled: true});
        }
    },

    /**
     * Handle store change event.
     * @param {Object} data       The data received from the server.
     * @param {String} searchTerm The search term. Defaults to state.inputValue
     */
    onDataReceived: function(data, searchTerm) {
        if(!data){
            this.onError();
            return;
        }

        searchTerm = searchTerm || this.state.inputValue;
        if(this.props.onDataReceived){
            data = this.props.onDataReceived(data, searchTerm);
            this.setState({shownList: data});
        }

        if(!this.props.isFullDataResponse && data.length){
            data = data.sort(this.sortMatchingEntries);
        }
        this.cache[this.getSearchTermCacheKey(searchTerm)] = data;
        this.updateStateForNewData(data);
    },

    /**
     * Updates various state components for newly shown data
     * @param {Array} data New data array
     */
    updateStateForNewData: function(data){
        var state = {
            itemList: data,
            disabled: false
        };
        if(!this.props.isFullDataResponse){
            state.shownList = data;
            this.currentFilteredList = data;
        }

        this.setState(state);
    },

    /**
     * Given a search term culls the item list to the list of closely matching item names. Search
     * will be case insensitive and ignore spaces.
     * @param  {String} searchTerm Term to search on
     * @return {Array}             List of matching items
     */
    getListOfMatchesForQuery: function(searchTerm){
        var matches = [];
        searchTerm = searchTerm.toLowerCase().split(" ").join("");
        _.forEach(this.state.itemList, function(item){
            var itemName = item.name.toLowerCase().split(" ").join(""),
                containsLocation = itemName.indexOf(searchTerm);
            if(containsLocation > -1){
                item.matchIndex = containsLocation;
                matches.push(item);
            }
        });
        if(matches.length){
            matches.sort(this.sortMatchingEntries);
        }
        return matches;
    },

    /* eslint-disable complexity */
    /**
     * Sorts matching item results from search to better find the closest match.
     * @param  {String} a First match
     * @param  {String} b Second match
     * @return {Number}   Sort order, either -1, 0, or 1
     */
    sortMatchingEntries: function(a, b){
        //Put matches that are earliest in the string first
        var aMatchIndex = a.matchIndex,
            bMatchIndex = b.matchIndex;

        //Look at secondary index if neither item has a primary index
        if(aMatchIndex === undefined && bMatchIndex === undefined){
            aMatchIndex = a.secondaryMatchIndex;
            bMatchIndex = b.secondaryMatchIndex;
        }

        //First check if either item doesn't match completely
        if(bMatchIndex !== undefined && aMatchIndex === undefined){
            return 1;
        }
        if(aMatchIndex !== undefined && bMatchIndex === undefined){
            return -1;
        }
        if(aMatchIndex === undefined && bMatchIndex === undefined){
            return 0;
        }

        //If they both match, take the one whose match appears earliest
        if(aMatchIndex > bMatchIndex){
            return 1;
        }
        if(aMatchIndex < bMatchIndex){
            return -1;
        }
        //If match is at same location, put shorter strings first
        if(a.name.length > b.name.length){
            return 1;
        }
        if(a.name.length < b.name.length){
            return -1;
        }
        //Finally, sort alphabetically
        if(a.name > b.name){
            return 1;
        }
        if(a.name < b.name){
            return -1;
        }
        return 0;
    },
    /* eslint-enable complexity */

    /**
     * Returns an object containing the searchFilterName plus any additional filters
     * @param  {String} searchTerm The term to search
     * @return {Object}            A search filter object
     */
    getSearchFilters: function(searchTerm) {
        var filters = this.props.additionalFilters || {};
        filters[this.props.searchFilterName] = searchTerm;

        return filters;
    },

    /**
     * Returns a modified cache key for the search term, and additionalFilters. Trims leading and trailing
     * whitespace, replaces multiple spaces with a single, and lowercases the value.
     * @param  {String} searchTerm User entered search term
     * @return {String}            Cache key modified search term
     */
    getSearchTermCacheKey: function(searchTerm){
        return JSON.stringify(this.getSearchFilters(_.trim(searchTerm))).toLowerCase().replace(/\s{2,}/g, ' ');
    },

    /**
     * Change handler for input element. Causes item list to update
     * and display
     * @param  {Object} event Input change event
     */
    onChange: function(event){
        var searchTerm = event.target.value;
        this.setState({inputValue: searchTerm});
        if(searchTerm.length < this.props.minLength){
            this.currentFilteredList = [];
            this.setState({shownList: []});
        }
        //Only continue of value entered is longer than min search term length
        else if(this.props.isFullDataResponse){
            var listToShow = this.getListOfMatchesForQuery(searchTerm);
            this.currentFilteredList = listToShow;
            this.setState({shownList: listToShow});
        }
        else{
            this.requestDataForTerm(searchTerm);
        }
    },

    /**
     * Focus handler for input element.
     */
    onFocus: function(){
        this.focusedIndex = null;
        this.setState({shownList: this.currentFilteredList, inputFocused: true});
    },

    /**
     * Handles blur event on input element. Only hides list if the action isn't occurring on the autocomplete list.
     */
    onBlur: function(){
        //If the users mouse is currently in the list, don't hide it
        if(this.actionOverList){
            return;
        }
        this.hideList();
    },

    /**
     * Handles keypress events when user is focused on search input element. Supports hitting the down
     * arrow to iterate over the result list and escape to close the list and reset input
     * @param  {Object} event Event object
     */
    onInputKeyPress: function(event){
        //We only care about key down (40), escape (27), and enter (13)
        if(!event.keyCode || (event.keyCode !== 40 && event.keyCode !== 27 && event.keyCode !== 13)){
            return;
        }
        event.preventDefault();
        if(event.keyCode === 40){
            this.focusNext();
        }
        else{
            if(event.keyCode === 13 && this.props.onInputSubmit){
                this.props.onInputSubmit(this.state.inputValue);
            }
            this.currentFilteredList = [];
            this.setState({shownList: [], inputValue: ''});
        }
    },

    /**
     * Handles keypress events when the user is focused on the autocomplete list. Supports moving up and
     * down between elements, hitting escape to clear the list, and hitting enter to select
     * @param  {Object} event Key event
     */
    onListKeyPress: function(event){
        var handler = this.listKeyCodeHandlers[event.keyCode];
        //Not an event we care about
        if(!handler || !this[handler]){
            return;
        }
        event.preventDefault();
        this[handler]();
    },

    /**
     * Focuses on the next item in the list
     */
    focusNext: function(){
        var index = this.focusedIndex;
        this.focusOnItemAtIndex(index === null ? 0 : ++index);
    },

    /**
     * Focuses on the previous item in the list. If at the top, changes
     * focus back to the input element
     */
    focusPrev: function(){
        var index = this.focusedIndex;
        if(index === null){
            return;
        }
        if(index === 0){
            this.refs.searchInput.focus();
        }
        else{
            this.focusOnItemAtIndex(--index);
        }
    },

    /**
     * Calls focus() on the list item at the index specified
     * @param  {Number} index Index to focus
     */
    focusOnItemAtIndex: function(index){
        var list = this.refs.list.childNodes;
        if(index > -1 && index < list.length){
            this.focusedIndex = index;
            this.actionOverList = true;
            list[index].focus();
        }
    },

    /**
     * Clears everything from the component (input text, autocomplete list)
     * @param  {Boolean} clearFocus Whether to not focus on input element
     */
    clearList: function(clearFocus){
        this.actionOverList = false;
        this.currentFilteredList = [];
        this.setState({inputValue: ''});
        this.hideList();
        if(!clearFocus){
            this.refs.searchInput.focus();
        }
    },

    /**
     * Hides the autocomplete list but doesn't clear it's contents
     */
    hideList: function(){
        this.focusedIndex = null;
        if (this.state.shownList.length || this.state.inputFocused) {
            this.setState({shownList: [], inputFocused: false});
        }
    },

    /**
     * Selects the item and fires off the event to create a new tab. Also
     * clears all content in the search input
     */
    selectItemOnEnter: function(){
        var selectedItem = this.refs.list.childNodes[this.focusedIndex];
        this.itemSelect({target: selectedItem});
    },

    /**
     * Handles a click or mouse enter event on autocomplete list item. Causes
     * searchSubmitCallback to be fired, hides autocomplete list, and clears out input
     * element value
     * @param  {Object} event Click/enter key event
     */
    itemSelect: function(event) {
        if (this.props.onSelect) {
            this.props.onSelect(event, this.state.inputValue);
        }

        this.clearList(true);
    },

    /**
     * Event when a user mouses over an element in the list
     * @param  {Object} event Mouse event
     */
    handleListMouseEnter: function(event){
        this.actionOverList = true;
        event.target.focus();
        _.forEach(this.refs.list.childNodes, function(child, index){
            if(child === event.target){
                this.focusedIndex = index;
            }
        }, this);
    },

    /**
     * Event when a user mouses out of the autocomplete list
     */
    handleListMouseLeave: function(){
        this.actionOverList = false;
    },

    /**
     * Returns list of autocomplete items to show in dropdown
     * @param  {Array}    rowData          List of node data
     * @param  {Function} listEnterHandler Method to invoke on list enter
     * @return {Array}                     List of nodes to display
     */
    getAutocompleteComponents: function(rowData, listEnterHandler){
        return _.map(rowData, function(item){
            return <li key={item.id} data-id={item.id} tabIndex="-1" onMouseEnter={listEnterHandler}>{item.name}</li>;
        }, this);
    },

    render: function() {
        var autoCompleteMarkup = (this.props.rowFormatter || this.getAutocompleteComponents)(this.state.shownList, this.handleListMouseEnter),
            searchIconClasses = Utils.classSet({
                fa: true,
                'fa-search': true,
                focused: this.state.inputFocused
            });

        var placeholderText = this.state.itemList ? this.props.placeholder : 'Loading...';

        return (
            <div ref="searchContainer" className="search-component">
                <div className="input-group">
                    <i className={searchIconClasses}/>
                    <input ref="searchInput"
                           value={this.state.inputValue}
                           type="search"
                           autoComplete="off"
                           placeholder={placeholderText}
                           disabled={this.state.disabled}
                           onChange={this.onChange}
                           onFocus={this.onFocus}
                           onBlur={this.onBlur}
                           onKeyDown={this.onInputKeyPress}
                    />
                    <ul ref="list"
                        className="autocomplete-list"
                        onClick={this.itemSelect}
                        onMouseLeave={this.handleListMouseLeave}
                        onKeyDown={this.onListKeyPress}>
                        {autoCompleteMarkup}
                    </ul>
                </div>
            </div>
        );
    }
});

module.exports = Search;
