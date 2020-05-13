const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const GenerateJsonPlugin = require('generate-json-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const baseWebpack = require('./webpack.base')
const { styleLoaders } = require('./tools')
const manifest = require('../src/manifest')

const rootDir = path.resolve(__dirname, '..')

module.exports = merge(baseWebpack, {
    watch: true,
    module: { rules: styleLoaders({ sourceMap: true }) },
    devtool: '#cheap-module-source-map',
    plugins: [
        new GenerateJsonPlugin('manifest.json', manifest, null, 2),
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.DefinePlugin({ 'process.env.NODE_ENV': '"development"' }),
        new FriendlyErrorsPlugin()
    ]
})
