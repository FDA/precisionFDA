/* globals module */

const { merge } = require('webpack-merge')

const base = require('./webpack.fragment.base')
const swc = require('./webpack.fragment.swc')


module.exports = merge(base, swc, {
  mode: 'development',
})
