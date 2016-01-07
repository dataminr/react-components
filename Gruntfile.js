'use strict';

module.exports = function(grunt) {

    var configs = require('load-grunt-configs')(grunt, {
        config : {
            src: "grunt/*.js"
        }
    });

    grunt.initConfig(configs);
    require("matchdep").filterAll("grunt-*").forEach(grunt.loadNpmTasks);

    /**
     * Default task to be used by developers. Startup webpack dev server
     */
    grunt.registerTask('default', [
        'webpack-dev-server:start',
    ]);

    /**
     * Runs all tests
     */
    grunt.registerTask('test',[
        'eslint',
        'karma'
    ]);

    /**
     * Runs tests and opens users browser to coverage report
     */
    grunt.registerTask('test:cov', [
        'test',
        'open:cov',
        'connect'
    ]);

    /**
     * Creates minified files of all necessary source files if and only if testing passes
     */
    grunt.registerTask('build', [
        'shell:build'
    ]);
};
