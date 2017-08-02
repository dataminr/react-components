'use strict';

var webpackConfig = require("../webpack.config.js");

module.exports.tasks = {
    "webpack-dev-server": {
        options: {
            webpack: webpackConfig,
            headers: {
                'Access-Control-Allow-Origin': 'http://localhost:8280'
            },
            port: 8280,
            hot: true,
            publicPath: webpackConfig.output.publicPath,
            historyApiFallback: true
        },
        start: {
            keepAlive: true,
            webpack: {
                debug: true
            }
        }
    }
};
