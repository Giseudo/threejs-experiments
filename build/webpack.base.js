'use strict'
const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
	entry: {
		app: './src/main.js'
	},
	output: {
		path: path.join(__dirname, '..', 'docs'),
		publicPath: '/',
		filename: 'app.[hash:7].js'
	},
	resolve: {
		extensions: ['.js', '.glsl']
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /(node_modules)/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['babel-preset-env']
					}
				}
			},
			{
				test: /\.glsl$/,
				exclude: /(node_modules)/,
				use: {
					loader: 'raw-loader'
				}
			}
		]
	},
	plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
      },
      chunksSortMode: 'dependency'
		}),
		new webpack.ProvidePlugin({
			THREE: 'three',
			Zlib: ['three/examples/js/libs/inflate.min', 'Zlib'],
			'window.Zlib': ['three/examples/js/libs/inflate.min', 'Zlib']
		})
	]
}
