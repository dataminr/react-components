define(function() {
    'use strict';

    return {
        /**
         * Capitalize the first letter of a string.
         * @param {String} string
         * @returns {String}
         */
        capitalizeFirstLetter: function (string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }
    };
});
