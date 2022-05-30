/* globals module __dirname */

const path = require('path')

// NOTE(samuel) reason for exporting function instead of normal config is
// failure of `yarn server` command without options.parseMap setting
// also when options.parseMap is enabled "yarn docker:build" fails
// Therefore we need to consider two versions of swc config for webpack

module.exports = ({ enableSourceMaps } = { enableSourceMaps: false }) => ({
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
        ...(enableSourceMaps ? {
          options: {
            parseMap: true,
          },
        } : {}),
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  },
})
