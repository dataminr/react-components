define(function(require) {
    'use strict';

    var $ = require('jquery');

    return {
        /**
         * Make an ajax request.
         * @param  {string} url - Url to request
         * @param  {[type]} data - Query string parameters to send with request
         * @param  {function} successCallback - Method to execute upon success
         * @param  {function} errorCallback - Method to execute upon failure
         * @param  {object|null} scope - Scope to execute callbacks
         */
        request: function(url, data, successCallback, errorCallback, scope){
            $.ajax({
                type: 'GET',
                url: url,
                data: data,
                dataType: 'json',
                context: scope || window,
                success: successCallback,
                error: errorCallback,
                timeout: 10000
            });
        }
    };
});
