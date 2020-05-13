const webpack = require('webpack')
const merge = require('webpack-merge')
const ZipPlugin = require('zip-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const baseWebpack = require('./webpack.base')
const { styleLoaders } = require('./tools')
const GenerateJsonPlugin = require('generate-json-webpack-plugin')
const manifest = require('../src/manifest')

module.exports = merge(baseWebpack, {
    module: { rules: styleLoaders({ extract: true, sourceMap: false }) },
    plugins: [
        new GenerateJsonPlugin('manifest.json', manifest, null, 2),
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.DefinePlugin({ 'process.env.NODE_ENV': '"production"' }),
        new OptimizeCSSPlugin({ cssProcessorOptions: { safe: true } }),
        new ExtractTextPlugin({ filename: 'css/[name].[contenthash].css' }),
        new webpack.HashedModuleIdsPlugin(),
        new ZipPlugin({
            path: '..',
            filename: 'tronmask.zip'
        })
    ]
})
