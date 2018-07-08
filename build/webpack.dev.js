var webpack = require('webpack')
var merge = require('webpack-merge');
var baseWebpackConfig = require('./webpack.base');

module.exports = merge(baseWebpackConfig, {
  devtool: 'cheap-module-eval-source-map',
  devServer: {
    publicPath: '/',
		contentBase: './static'
  },
	output: {
		path: path.join(__dirname, '..', 'docs'),
		publicPath: '/',
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
				'NODE_ENV': JSON.stringify('development')
			}
		})
	]
})
