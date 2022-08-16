/* globals module __dirname */
/* eslint-disable no-undef */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-var-requires */

const path = require('path')

const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const captchaKey = process.env.RECAPTCHA_SITE_KEY
const isProdOrStage = process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging'

module.exports = ({ urlLoaderOptions }) => ({
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, '../app/assets/packs/'),
    filename: 'bundle.js',
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'bundle.css',
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
    new webpack.DefinePlugin({
      RECAPTCHA_SITE_KEY: JSON.stringify(captchaKey),
      PROD_OR_STAGE: JSON.stringify(isProdOrStage),
    }),
  ],
  module: {
    rules: [
      {
        test: /\.s(a|c)ss$/,
        exclude: [/dist/, /.build_cache/],
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.(png|jpg)$/,
        exclude: /node_modules/,
        loader: 'url-loader',
        options: urlLoaderOptions || {
          limit: 2000,
          outputPath: '',
          publicPath: '/assets/',
        },
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  },
})
