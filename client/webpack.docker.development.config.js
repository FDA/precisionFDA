/* globals module __dirname */
/* eslint-disable @typescript-eslint/no-var-requires */

const path = require('path')

const { merge } = require('webpack-merge')

const base = require('./webpack.fragment.base')
const swc = require('./webpack.fragment.swc')


module.exports = merge(base({}), swc({}), {
  mode: 'development',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  // TODO(samuel) cache profiling in case needed
  // https://webpack.js.org/configuration/cache#cacheprofile
  cache: {
    type: 'filesystem',
    name: 'PfdaBuildCache',
    cacheDirectory: path.resolve(__dirname, '.build_cache'),
    buildDependencies: {
      config: [__filename],
    },
    version: 'docker',
  },
})
