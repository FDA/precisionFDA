/* globals module __dirname */

const path = require('path')
const fs = require('fs')

const webpack = require('webpack')
const merge = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const development = require('./webpack.development.config')


module.exports = merge(development, {
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      filename: 'spaces',
    }),
  ],
  devServer: {
    contentBase: path.resolve(__dirname, './dist'),
    compress: true,
    port: 9000,
    hot: true,
    https: {
      key: fs.readFileSync(path.resolve('../key.pem')),
      cert: fs.readFileSync(path.resolve('../cert.pem')),
    },
  },
})
