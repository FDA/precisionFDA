/* globals module __dirname */
/* eslint-disable @typescript-eslint/no-var-requires */

const path = require('path')


module.exports = {
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, '../app/assets/packs/'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
    ],
  },
}

