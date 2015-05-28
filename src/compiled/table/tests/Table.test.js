define(function(require) {
    var Helpers = require('drc/tests/helpers');
    var React = require('react');
    var Table = require('drc/table/Table');
    var TableActions = require('drc/table/TableActions');
    var TestUtils = React.addons.TestUtils;
    var Utils = require('drc/utils/Utils');

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
                Helpers.mockReactComponent('BasicTable', {className: 'fake-basic-table'});
                table = TestUtils.renderIntoDocument(React.createElement(Table, null));

                expect(table.props.type).toEqual('basic');
            });
        });

        describe('getTable function', function() {
            it('should attempt to render a basic table.', function() {
                props.type="basic";
                Helpers.mockReactComponent('BasicTable', {className: 'fake-basic-table'});
                table = TestUtils.renderIntoDocument(React.createElement(Table, React.__spread({},  props)));

                expect(React.createElement.calls.argsFor(1)[1].type).toEqual('basic');
            });

            it('should attempt to render a grouped actions table.', function() {
                props.type="groupedActions";
                Helpers.mockReactComponent('GroupedActionsTable', {className: 'fake-grouped-actions-table'});
                table = TestUtils.renderIntoDocument(React.createElement(Table, React.__spread({},  props)));

                expect(React.createElement.calls.argsFor(1)[1].type).toEqual('groupedActions');
            });
        });
    });
});
