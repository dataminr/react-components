var path = require('path');
var webpack = require("webpack");

module.exports = {
    entry: {
        app: ['./examples/main.js']
    },
    output: {
        path: path.join(__dirname, 'dist'),
        publicPath: 'http://localhost:8280/',
        filename: 'drc.js',
    },
    resolve: {
        alias: {
            RequestHandler$: path.join(__dirname, 'examples', 'RequestHandler.js'),
        }
    },
    devtool: 'cheap-module-source-map',
    //Fixes for when using npm link to symlink deps
    resolveLoader: {
        modulesDirectories: ['node_modules'],
        fallback: path.join(__dirname, "../", "node_modules")
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel',
                query: {
                    cacheDirectory: true,
                    presets: ['react', 'es2015']
                },
                exclude: /node_modules/
            },
            {
                test: /\.scss$/,
                loader: 'style!css?sourceMap!sass?sourceMap'
            },
            {
                test: /\.css$/,
                loader: 'style-loader!css-loader'
            },
            {
                test: /\.(png|jpg|jpeg|ttf)$/,
                loader: 'url?limit=3000'
            }
        ]
    },
    plugins: [
        new webpack.NoErrorsPlugin(),
        new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en/),
    ]
};