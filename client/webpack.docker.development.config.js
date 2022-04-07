/* globals module __dirname */

const path = require('path')

const { merge } = require('webpack-merge')

const common = require('./webpack.common.config')


module.exports = merge(common, {
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
      // eslint-disable-next-line no-undef
      config: [__filename],
    },
    version: 'docker',
  },
})
