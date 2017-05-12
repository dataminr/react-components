var PieChart = require('../PieChart');
var React = require('react');
var PieChartStore = require('../PieChartStore');
var Utils = require('../../utils/Utils');
var TestUtils = require('react-dom/test-utils');

describe('PieChart', function() {
    var pieChart, props, id;

    var definition = {
        url: 'chart/company',
        label: 'Companies'
    };

    var pieChartData = {
        data: [
            {name: 'CompanyA', value: 15, percent: 30},
            {name: 'CompanyB', value: 25, percent: 50},
            {name: 'CompanyC', value: 10, percent: 20},
        ]
    };

    beforeEach(function() {
        id = 'pie-chart-' + Utils.guid();
        props = {
            definition: definition,
            componentId: id,
            filters: {},
            loadingIconClasses: ['icon', 'ion-loading-c']
        };

        pieChart = TestUtils.renderIntoDocument(<PieChart {...props} />);
        pieChart.requestData();
    });

    describe('getRowDisplay function', function() {
        it('should show default row data', function() {
            pieChart.state.dataStack = [pieChartData];
            var markup = pieChart.getRowDisplay();
            expect(markup.length).toEqual(3);
            var assertions = function(index, companyName, companyValue, companyTitle){
                var row = markup[index].props.children.props.children.props.children,
                    name = row[1],
                    value = row[2];
                expect(name.props.children).toEqual(companyName);
                expect(value.props.children).toEqual(companyValue);
                expect(value.props.title).toEqual(companyTitle);
            };
            assertions(0, 'CompanyA', '30%', 'Count: 15');
            assertions(1, 'CompanyB', '50%', 'Count: 25');
            assertions(2, 'CompanyC', '20%', 'Count: 10');
        });

        it('should show row data with valueFormat override', function() {
            props.definition.valueFormat = function(data) {
                return (
                    <span className="table-val">
                        <span className="number">{data.value}</span>
                        <span className="percent">{data.percent}%</span>
                    </span>
                );
            };
            pieChart = TestUtils.renderIntoDocument(<PieChart {...props} />);
            pieChart.requestData();

            pieChart.state.dataStack = [pieChartData];
            var markup = pieChart.getRowDisplay();
            expect(markup.length).toEqual(3);
            var assertions = function(index, companyName, companyValue, companyPercent){
                if(index % 2 === 0) {
                    expect(markup[index].props.className).toEqual('table-odd');
                }
                else {
                    expect(markup[index].props.className).toEqual('table-even');
                }
                var row = markup[index].props.children.props.children.props.children,
                    name = row[1],
                    value = row[2];
                expect(name.props.children).toEqual(companyName);
                expect(value.props.children[0].props.children).toEqual(companyValue);
                expect(value.props.children[1].props.children.join('')).toEqual(companyPercent);
            };
            assertions(0, 'CompanyA', 15, '30%');
            assertions(1, 'CompanyB', 25, '50%');
            assertions(2, 'CompanyC', 10, '20%');
        });
    });
});
