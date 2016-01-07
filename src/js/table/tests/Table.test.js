var ExpandedTestUtils = require('expanded-react-test-utils');
var React = require('react');
var Table = require('../Table');
var TableActions = require('../TableActions');
var TestUtils = require('react-addons-test-utils');
var Utils = require('../../utils/Utils');

describe('Table', function() {
    var table, props;
    var definition = {
        url: 'table/test',
        cols: [
            {
                headerLabel: 'TEST',
                dataProperty: 'test',
                dataType: 'string',
                width: '100%'
            }
        ]
    };

    beforeEach(function() {
        var id = 'table-' + Utils.guid();
        spyOn(TableActions, 'requestData');

        props = {
            definition: definition,
            componentId: id,
            key: id,
            filters: {},
            loadingIconClasses: ['icon', 'ion-loading-c']
        };
    });

    describe('getDefaultProps function', function() {
        it('should set the default table type to basic if no type was declared.', function() {
            ExpandedTestUtils.mockReactComponent('BasicTable', {className: 'fake-basic-table'});
            table = TestUtils.renderIntoDocument(<Table />);

            expect(table.props.type).toEqual('basic');
        });
    });

    describe('getTable function', function() {
        it('should attempt to render a basic table.', function() {
            props.type="basic";
            ExpandedTestUtils.mockReactComponent('BasicTable', {className: 'fake-basic-table'});
            table = TestUtils.renderIntoDocument(<Table {...props} />);

            expect(React.createElement.calls.argsFor(1)[1].type).toEqual('basic');
        });

        it('should attempt to render a grouped actions table.', function() {
            props.type="groupedActions";
            ExpandedTestUtils.mockReactComponent('GroupedActionsTable', {className: 'fake-grouped-actions-table'});
            table = TestUtils.renderIntoDocument(<Table {...props} />);

            expect(React.createElement.calls.argsFor(1)[1].type).toEqual('groupedActions');
        });
    });
});
