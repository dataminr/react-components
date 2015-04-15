define(function(require) {
    var StringUtils = require('drc/utils/StringUtils');

    describe('StringUtils', function() {
        describe('capitalizeFirstLetter function', function() {
            it('should capitalize the first character of a string', function() {
                var str = 'test';
                str = StringUtils.capitalizeFirstLetter(str);
                expect(str).toEqual('Test');
            });
        });
    });
});
