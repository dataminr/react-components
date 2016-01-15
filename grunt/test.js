var webpack = require('webpack'),
    webpackConfig = require("../webpack.config.js"),
    fileFilterRegex;

module.exports = function(grunt) {
    var fileFilter = grunt.option('filter');
    if(fileFilter && typeof fileFilter === 'string'){
        fileFilterRegex = new RegExp(fileFilter + '.test.js', "g");
    }
    return { tasks: {

        karma: {
            options: {
                files: [
                    'node_modules/phantomjs-polyfill/bind-polyfill.js',
                    'tests.webpack.js',
                ]
            },
            unit: {
                autoWatch: true, //Watch for file changes and re-run tests automatically
                frameworks: ['jasmine', 'jasmine-matchers'],
                browserNoActivityTimeout: 60000,
                preprocessors: {
                    'tests.webpack.js': ['webpack']
                },
                reporters: ['coverage', 'spec'],
                coverageReporter: {
                    dir: 'bin/coverage/',
                    reporters: [
                        {type: 'html', subdir: 'phantom'}
                    ]
                },
                webpack: {
                    babel: {
                        presets: ['es2015', 'react']
                    },
                    resolve: webpackConfig.resolve,
                    resolveLoader: webpackConfig.resolveLoader,
                    module: {
                        preLoaders: [
                            // transpile test files with babel as usual
                            {
                                test: /\.test\.js$/,
                                loader: 'babel',
                                exclude: /node_modules/
                            },
                            // transpile and instrument testing files with isparta
                            {
                                test: /\.js$/,
                                exclude: [/node_modules/, /\.test\.js$/, /.webpack\.js$/],
                                loader: 'isparta',
                            }
                        ]
                    },
                    plugins: [
                        new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en/),
                        new webpack.DefinePlugin({
                            _DEVELOPMENT_: true,
                            //Set define used in tests.webpack.js to either filter to a specific file or run all .test.js files
                            _FILTER_REGEX_: fileFilterRegex || /\.test\.js$/
                        })
                    ]
                },
                webpackServer: {
                    noInfo: true
                },
                browsers: ['PhantomJS'],
                // singleRun: true unless filtering
                // To run tests on a single file, use `grunt test -filter <FileName>`
                // (File name is case sensitive, should not include file extension)
                singleRun: grunt.option('filter') === undefined
            }
        },

        /**
         * ESLint configuration. See http://eslint.org and the .eslintrc file for details.
         */
        eslint:{
            target: [
                'src/**/*.js',
                '!src/js/tests/*.js',
                '!src/js/lib/EventEmitter.js',
                '!src/**/*.test.js',
                '!examples/**/*.js',
            ]
        },

        /**
         * Static web server used to server code coverage result files.
         */
        connect: {
            all: {
                options: {
                    port: "9001",
                    hostname: "0.0.0.0",
                    keepalive: true
                }
            }
        },

        /**
         * Opens users browser to a specific URL.
         * @type {Object}
         */
        open: {
            test: {
                path: 'http://localhost:<%= connect.all.options.port%>/_SpecRunner.html'
            },
            cov: {
                // Gets the port from the connect configuration
                path: 'http://localhost:<%= connect.all.options.port%>/bin/'
            }
        }
    }};
};
