/* globals module __dirname */
/* eslint-disable no-undef */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-var-requires */

const path = require('path')

const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const captchaKey = process.env.RECAPTCHA_SITE_KEY
const isProdOrStage = process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging'

module.exports = ({ urlLoaderOptions }) => ({
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, '../rails/app/assets/packs/'),
    filename: 'bundle.js',
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'bundle.css',
      ignoreOrder: true,
    }),
    new webpack.DefinePlugin({
      RECAPTCHA_SITE_KEY: JSON.stringify(captchaKey),
      PROD_OR_STAGE: JSON.stringify(isProdOrStage),
      NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      ENABLE_DEV_MSW: JSON.stringify(Boolean(process.env.ENABLE_DEV_MSW)),
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'node_modules/monaco-editor/min/vs',
          to: 'monaco-editor/min/vs',
        },
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.s(a|c)ss$/,
        exclude: [/dist/, /.build_cache/],
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
        generator: {
           filename: '[name][ext]',
        },
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  },
})
