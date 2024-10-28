const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = {
    resolve: {
        fallback: {
            "path": require.resolve("path-browserify"),
            "fs": false
        }
    },
    plugins: [
        new NodePolyfillPlugin()
    ]
};