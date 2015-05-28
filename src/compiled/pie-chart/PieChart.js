define(function(require) {
    'use strict';

    var d3 = require('d3');
    var DataMixins = require('drc/mixins/DataMixins');
    var $ = require('jquery');
    var _ = require('lodash');
    var PieChartActions = require('drc/pie-chart/PieChartActions');
    var PieChartStore = require('drc/pie-chart/PieChartStore');
    var React = require('react');
    var Utils = require('drc/utils/Utils');

    var defaultColors = [
        '#00B0F1', //dark blue
        '#6DD2F7', //light blue
        '#58C99E', //light green
        '#11B275', //dark green
        '#53959C', //slate
        '#545F88', //lavender
        '#6E4A99', //grape
        '#D35E5E', //pink
        '#E4C000', //yellow
        '#F37E1C', //orange
        '#ECECEC', //off-white
        '#BC0C0C'  //red
    ];

    /**
     * PieChart React Class
     */
    var PieChart = React.createClass({displayName: 'PieChart',
        propTypes: {
            componentId: React.PropTypes.string.isRequired,
            colors: React.PropTypes.array,
            definition: React.PropTypes.object.isRequired,
            filters: React.PropTypes.object,
            loadingIconClasses: React.PropTypes.oneOfType([
                React.PropTypes.string,
                React.PropTypes.array
            ])
        },

        mixins: [
            DataMixins.dataRequest,
            DataMixins.destroySelfOnUnmount(PieChartActions),
            DataMixins.eventSubscription(PieChartStore)
        ],

        /**
         * Stores DOM node holding chart
         * @type {Object}
         */
        chart: null,

        /**
         * Function to generate chart segments
         * @type {Function}
         */
        arc: null,

        /**
         * Pixels to add to segment radius. Used for mouseover events.
         * @type {Number}
         */
        extraRadius: 0,

        /**
         * Returns initial data for Pie Chart. Calculates loading property
         * if we haven't yet received data
         * @return {Object} Initial state of chart
         */
        getInitialState: function() {
            this.colors = this.props.colors && _.isArray(this.props.colors) ? this.props.colors : defaultColors;
            return {
                loading: true,
                svgID: 'pieChart' + this.props.componentId,
                dataStack: [],
                selectedRowName: null,
                width: 1,
                height: 1,
                radius: 1,
                dataError: false
            };
        },

        /**
         * Creates contents of SVG compoenent to render pie chart. Also adds
         * events for mouseover/mouseout/click to handle animations and drill ins
         * @param {Object} data Data to display in pie chart
         */
        createVisualization: function(data){
            var colorCounter = 0,
            //For animation delays, only do a delay if we have a handful of elements. We don't want the chart to take 10 seconds to render
                delay = (data.length > 5) ? (data.length > 8) ? 25 : 50 : 75;

            //Clear out any existing svg path nodes
            d3.select("#" + this.state.svgID + "-container").selectAll("*").remove();

            var pie = d3.layout.pie()
                .padAngle(0.03)
                .value(function(dataNode){return dataNode.value; })
                //Data comes pre-sorted from the server so don't let d3 to any additional sorting
                .sort(null);

            var g = this.chart.selectAll("path")
                .data(pie(data))
                .enter();

            var group = g.append('path');

            group
                .style("fill", function() { return this.colors[colorCounter++]; }.bind(this))
                .style("cursor", function(dataNode) {
                    if (_.isArray(dataNode.data.children) && dataNode.data.children.length) {
                        return "pointer";
                    }
                })
                .transition()
                .delay(function(dataNode, index) { return index * delay; })
                .duration(150)
                .attrTween('d', function(dataNode) {
                    var interpolate = d3.interpolate(dataNode.startAngle + 0.1, dataNode.endAngle);
                    return function(time) {
                        dataNode.endAngle = interpolate(time);
                        return this.arc(dataNode);
                    }.bind(this);
                }.bind(this))
                //Add mouse events only after animation is complete.
                .each("end", function(){
                    setTimeout(function(){
                        group.on("click", this.drillIn);
                        group.on("mouseover", this.mouseover);
                        group.on("mouseleave", this.mouseout);
                    }.bind(this), 400);
                }.bind(this));
        },

        /**
         * Handles clicking on a segment to drill in. If segment
         * has no sub data, nothing will happen
         * @param {Object} node Data of segment clicked
         */
        drillIn: function(node){
            if(!node.data.children){
                return;
            }
            var dataStack = this.state.dataStack;
            dataStack.push({
                data: node.data.children,
                label: node.data.name + " - " + node.data.percent + "%"
            });
            this.createVisualization(node.data.children);
            this.setState({dataStack: dataStack});
            $("#item-list-" + this.props.componentId).scrollTop(0);
        },

        /**
         * Handles clicking on parent label to go back to parent data
         */
        drillOut: function(){
            var dataStack = this.state.dataStack;
            dataStack.pop();
            this.createVisualization(_.last(dataStack).data);
            this.setState({dataStack: dataStack});
            $("#item-list-" + this.props.componentId).scrollTop(0);
        },

        /**
         * Handles mouseover event. Causes the segment that was hovered on to increase it's radius
         * size a bit.
         * @param {Object} dataNode Data of node that was hovered
         */
        mouseover: function(dataNode){
            this.setState({selectedRowName: dataNode.data.name});

            // Shrink all the segments back to normal radius.
            this.chart.selectAll("path").attr('d', this.arc);

            //Expand radius of selected node
            this.extraRadius = 10;
            this.chart.selectAll("#" + this.state.svgID + " path")
                .filter(function(node) {
                    return node.data.name === dataNode.data.name;
                })
                .transition()
                .duration(100)
                .attr('d', this.arc);
            this.extraRadius = 0;
        },

        /**
         * Handles leaving a segment. Shinks radius back to normal size
         */
        mouseout: function(){
            var mouseover = this.mouseover;
            this.setState({selectedRowName: null});
            this.chart.selectAll("path").on("mouseover", null);

            // Transition each segment back to normal radius then re-add mouseover
            this.chart.selectAll("path")
                .transition()
                .duration(100)
                .attr("d", this.arc)
                .each(function() {
                    d3.select(this).on("mouseover", mouseover);
                });
        },

        /**
         * Handle store change event. Calculate the width of the area we're rendering in and
         * build up the chart with the data
         */
        onDataReceived: function() {
            var data = PieChartStore.getData(this.props.componentId);

            if(!data){
                this.onError();
                return;
            }

            //Calculate height and width from the width of the container
            var chartContainer = d3.select("#" + this.state.svgID),
                width = Math.min(325, parseInt(chartContainer.style("width"))) - 25,
                height = width * 0.75,
                radius = (Math.min(width, height) / 2) - 20;

            var dataStack = this.state.dataStack;
            dataStack.push({
                data: data,
                label: null
            });

            this.setState({
                width: width,
                height: height,
                radius: radius,
                dataStack: dataStack,
                loading: false
            });

            this.chart = d3.select('#' + this.state.svgID + '-container');

            this.arc = d3.svg.arc()
                .outerRadius(_.bind(function(){
                    return radius + this.extraRadius;
                }, this))
                .innerRadius(radius - 50);

            this.createVisualization(data);
        },

        /**
         * Handle request error.
         */
        onError: function(){
            this.setState({loading: false, dataError: true});
        },

        /**
         * Send a request for data
         */
        requestData: function() {
            this.setState({loading: true, dataError: false});
            PieChartActions.requestData(this.props.componentId, this.props.definition, this.props.filters);
        },

        /**
         * After the render cycle runs, check if a row is currently selected and, if necessary,
         * scroll to the item in the list. This makes it so the pie chart segment being hovered
         * is always visible in the table.
         */
        componentDidUpdate: function(){
            var selectedRow = $("tr.selected");
            if(selectedRow && selectedRow.prop('rowIndex') !== undefined){
                var rowIndex = selectedRow.prop('rowIndex'),
                    scrollHeight = 0;
                //We only scroll items past the first 4 since we can always see 4 items
                //in the list
                if(rowIndex > 3){
                    //Rows are either 46 or 48 px wide (odd vs even rows) so split the distance. We also
                    //only scroll every 4th item
                    scrollHeight = 47 * (rowIndex - (rowIndex % 4));
                }
                $("#item-list-" + this.props.componentId).stop().animate({
                    scrollTop: scrollHeight
                }, 150);
            }
        },

        /**
         * Generates markup for table to display data list
         * @returns {Array} - The rows for the data list
         */
        getRowDisplay: function(){
            var rows = [],
                dataList = _.last(this.state.dataStack),
                i;

            if(!dataList){
                return false;
            }
            dataList = dataList.data;

            for(i = 0; i < dataList.length; i++){
                var data = dataList[i],
                    color = {backgroundColor: this.colors[i]},
                    isSelected = this.state.selectedRowName === data.name,
                    rowBackground = isSelected ? {'borderLeft': "solid 6px " + this.colors[i]} : {},
                    rowClasses = React.addons.classSet({
                        'table-even': i % 2,
                        'table-odd': i % 2 === 0,
                        'selected': isSelected
                    });

                rows.push(
                    React.createElement("tr", {key: 'table-row-' + Utils.guid(), className: rowClasses}, React.createElement("td", null, 
                        React.createElement("div", {className: "row-container", style: rowBackground}, 
                            React.createElement("span", {className: "color-legend", style: color}), 
                            React.createElement("span", {className: "table-key"}, data.name), 
                            React.createElement("span", {className: "table-val", title: "Count: " + data.value}, data.percent + "%")
                        )
                    )));
            }
            return rows;
        },

        render: function() {
            var noResults;
            var tableContents = this.getRowDisplay(),
                currentData = _.last(this.state.dataStack),
                breadCrumb;
            if(currentData && currentData.label){
                breadCrumb = React.createElement("span", {className: "breadCrumb", onClick: this.drillOut}, React.createElement("i", {className: "ion ion-chevron-left"}), currentData.label);
            }

            var containerClasses = React.addons.classSet({
                'data-container': true,
                masked: this.state.loading || this.state.dataError,
                error: this.state.dataError
            });

            if (currentData && !currentData.data.length) {
                noResults = React.createElement("div", {className: "no-results"}, "There were no results that matched the selected range.");
            }

            return (
                React.createElement("div", {className: "data-component pie-chart"}, 
                    React.createElement("span", {className: "module-sub-heading"}, PieChartStore.getLabel(this.props.componentId)), 
                    React.createElement("div", {className: containerClasses}, 
                        React.createElement("i", {className: Utils.getLoaderClasses(this.state.loading, this.props.loadingIconClasses)}), 
                        React.createElement("div", {className: "pie-chart-data"}, 
                            breadCrumb, 
                            noResults, 
                            React.createElement("div", {id: this.state.svgID, ref: "chartNode", className: "pie-chart-wrapper"}, 
                                React.createElement("svg", {height: this.state.height, width: this.state.width}, 
                                    React.createElement("g", {key: this.state.svgID, id: this.state.svgID + '-container', transform: 'translate(' + this.state.width / 2 + ',' + this.state.height / 2 + ')'}
                                    )
                                )
                            )
                        ), 
                        React.createElement("div", {className: "table-container", id: "item-list-" + this.props.componentId}, 
                            React.createElement("table", {className: "table-body"}, 
                                React.createElement("tbody", null, 
                                    tableContents
                                )
                            )
                        )
                    )
                )
                );
        }
    });

    return PieChart;
});
