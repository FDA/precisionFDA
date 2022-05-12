/* globals module */

const { merge } = require('webpack-merge')

const base = require('./webpack.fragment.base')
const babel = require('./webpack.fragment.babel')


module.exports = merge(base, babel, {
  mode: 'production',
  devtool: 'eval',
})
