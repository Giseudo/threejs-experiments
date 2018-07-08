var webpack = require('webpack')
var merge = require('webpack-merge')
var path = require('path')
var baseWebpackConfig = require('./webpack.base')
var CopyWebpackPlugin = require('copy-webpack-plugin')
var CleanWebpackPlugin = require('clean-webpack-plugin')

module.exports = merge(baseWebpackConfig, {
	devtool: 'cheap-source-map',
	module: {
		rules: [
			//
		]
	},
	plugins: [
		new webpack.DefinePlugin({
			'process.env': {
				'NODE_ENV': JSON.stringify('production')
			}
		}),

		new CleanWebpackPlugin([
			'docs'
		], {
			root: path.join(__dirname, '..')
		}),

		new CopyWebpackPlugin([
			{
				from: 'static/textures',
				to: 'textures'
			},
			{
				from: 'static/models',
				to: 'models'
			},
		], {})
	]
})
