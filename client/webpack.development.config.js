/* globals module __dirname */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-var-requires */

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

const urlLoaderOptions = {
  limit: 2000,
}
const swcLoaderOptions = {
  parseMap: true,
}

module.exports = merge(base({ urlLoaderOptions }), swc({ swcLoaderOptions }), {
  mode: 'development',
  entry: './src/index.tsx',
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new ReactRefreshWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, './src/index.html'),
    }),
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        exclude: [/node_modules/, /dist/, /.build_cache/],
        loader: 'babel-loader',
        options: {
          plugins: ['babel-plugin-styled-components'],
          presets: [],
          cacheDirectory: true,
          cacheCompression: false,
        },
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
    client: {
      overlay: false,
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
      '/discussions': {
        target: TARGET,
        secure: false,
      },
      '/apps': {
        target: TARGET,
        secure: false,
      },
      '/workflows': {
        target: TARGET,
        secure: false,
      },
      '/notes': {
        target: TARGET,
        secure: false,
      },
      '/comparisons': {
        target: TARGET,
        secure: false,
      },
      '/licenses': {
        target: TARGET,
        secure: false,
      },
      '/users': {
        target: TARGET,
        secure: false,
      },
      '/profile': {
        target: TARGET,
        secure: false,
      },
      '/guidelines': {
        target: TARGET,
        secure: false,
      },
      '/docs': {
        target: TARGET,
        secure: false,
      },
    },
  },
})
