/* globals module __dirname */
/* eslint-disable @typescript-eslint/no-var-requires */

const path = require('path')
const fs = require('fs')

const webpack = require('webpack')
const { merge } = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')

require('events').EventEmitter.defaultMaxListeners = 20

const base = require('./webpack.fragment.base')
const swc = require('./webpack.fragment.swc')

// const TARGET = 'https://precisionfda-dev.dnanexus.com'
const TARGET = 'https://0.0.0.0:3000'

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
    static: ['./dist', path.join(__dirname, '../rails/public'), path.join(__dirname, './public')],
    historyApiFallback: true, // See https://stackoverflow.com/questions/56573363/react-router-v4-nested-routes-not-work-with-webpack-dev-server
    host: '0.0.0.0', // See https://github.com/webpack/webpack-dev-server/issues/547
    port: 4000,
    server: {
      type: 'https',
      options: {
        key: fs.readFileSync(path.resolve('./../../key.pem')),
        cert: fs.readFileSync(path.resolve('./../../cert.pem')),
      },
    },
    proxy: [
      {
        context: ['/logout'],
        target: TARGET,
        secure: false,
      },
      {
        context: ['/return_from_login'],
        target: TARGET,
        secure: false,
      },
      {
        context: ['/login'],
        target: TARGET,
        secure: false,
      },
      {
        context: ['/api'],
        target: TARGET,
        secure: false,
      },
      {
        context: ['/pdfs'],
        target: TARGET,
        secure: false,
      },
      {
        context: ['/assets'],
        target: TARGET,
        secure: false,
      },

      {
        context: ['/discussions'],
        target: TARGET,
        secure: false,
      },
      {
        context: ['/apps'],
        target: TARGET,
        secure: false,
      },
      {
        context: ['/workflows/new'],
        target: TARGET,
        secure: false,
      },
      {
        context: ['/workflows/*/edit'],
        target: TARGET,
        secure: false,
      },
      {
        context: ['/notes'],
        target: TARGET,
        secure: false,
      },
      {
        context: ['/comparisons'],
        target: TARGET,
        secure: false,
      },
      {
        context: ['/licenses'],
        target: TARGET,
        secure: false,
      },
      {
        context: ['/users'],
        target: TARGET,
        secure: false,
      },
      {
        context: ['/profile'],
        target: TARGET,
        secure: false,
      },
      {
        context: ['/guidelines'],
        target: TARGET,
        secure: false,
      },
      {
        context: ['/publish'],
        target: TARGET,
        secure: false,
      },
      {
        context: ['/experts/*/edit'],
        target: TARGET,
        secure: false,
      },
      {
        context: ['/experts/new'],
        target: TARGET,
        secure: false,
      },
      {
        context: ['/experts/*/qa'],
        target: TARGET,
        secure: false,
      },
      {
        context: ['/challenges/*/editor/*'],
        target: TARGET,
        secure: false,
      },
      {
        context: ['/jobs'],
        target: TARGET,
        secure: false,
      },
    ],
  },
})
