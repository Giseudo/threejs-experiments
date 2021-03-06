var webpack = require('webpack')
var merge = require('webpack-merge')
var path = require('path')
var baseWebpackConfig = require('./webpack.base')
var CopyWebpackPlugin = require('copy-webpack-plugin')
var CleanWebpackPlugin = require('clean-webpack-plugin')

module.exports = merge(baseWebpackConfig, {
	devtool: 'cheap-source-map',
	output: {
		path: path.join(__dirname, '..', 'docs'),
		publicPath: '/threejs-experiments/',
		filename: 'app.[hash:7].js'
	},
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
			{ from: 'static/images', to: 'images' },
			{ from: 'static/textures', to: 'textures' },
			{ from: 'static/models', to: 'models' }
		], {})
	]
})
