'use strict';

var webpackConfig = require("../webpack.config.js");

module.exports.tasks = {
    "webpack-dev-server": {
        options: {
            webpack: webpackConfig,
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