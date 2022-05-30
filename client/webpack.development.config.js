/* globals module __dirname */

const path = require('path')
const fs = require('fs')

const webpack = require('webpack')
const { merge } = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')

const base = require('./webpack.fragment.base')
const swc = require('./webpack.fragment.swc')

// const TARGET = 'https://precisionfda-dev.dnanexus.com'
const TARGET = 'https://localhost:3000'

module.exports = merge(base, swc({ enableSourceMaps: true }), {
  mode: 'development',
  entry: './src/index.tsx',
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, './src/index.html'),
    }),
    new ReactRefreshWebpackPlugin(),
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: require.resolve('babel-loader'),
            options: {
              sourceMap: true,
              plugins: [require.resolve('react-refresh/babel')].filter(Boolean),
            },
          },
        ],
      },
    ],
  },
  watchOptions: {
    ignored: [
      path.resolve(__dirname, 'dist'),
      path.resolve(__dirname, 'node_modules'),
    ],
  },
  devtool: 'eval-source-map',
  devServer: {
    devMiddleware: {
      index: 'index.html',
    },
    static: './dist',
    historyApiFallback: true, // See https://stackoverflow.com/questions/56573363/react-router-v4-nested-routes-not-work-with-webpack-dev-server
    host: '0.0.0.0', // See https://github.com/webpack/webpack-dev-server/issues/547
    port: 4000,
    https: {
      key: fs.readFileSync(path.resolve('../key.pem')),
      cert: fs.readFileSync(path.resolve('../cert.pem')),
    },
    proxy: {
      '/logout': {
        target: TARGET,
        secure: false,
      },
      '/return_from_login': {
        target: TARGET,
        secure: false,
      },
      '/login': {
        target: TARGET,
        secure: false,
      },
      '/api': {
        target: TARGET,
        secure: false,
      },
      '/assets': {
        target: TARGET,
        secure: false,
      },
      '/admin': {
        target: TARGET,
        secure: false,
      },
    },
  },
})
