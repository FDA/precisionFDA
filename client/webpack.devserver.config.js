/* globals module __dirname */

const path = require('path')
const fs = require('fs')

const webpack = require('webpack')
const merge = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const development = require('./webpack.development.config')


module.exports = merge(development, {
  entry: './src/index.tsx',
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, './src/index.html'),
    }),
  ],
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
  },
  devServer: {
    index: 'index.html',
    contentBase: path.resolve(__dirname, './dist'),
    compress: true,
    historyApiFallback: true, // See https://stackoverflow.com/questions/56573363/react-router-v4-nested-routes-not-work-with-webpack-dev-server
    host: '0.0.0.0', // See https://github.com/webpack/webpack-dev-server/issues/547
    port: 9000,
    publicPath: '/',
    hot: true,
    https: {
      key: fs.readFileSync(path.resolve('../key.pem')),
      cert: fs.readFileSync(path.resolve('../cert.pem')),
    },
  },
})
