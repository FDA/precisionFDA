/* globals module __dirname */

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
        loader: 'swc-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  },
}

