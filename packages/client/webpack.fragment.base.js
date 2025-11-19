/* globals module __dirname */
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */

const path = require('path')
require('dotenv').config()

const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const captchaEnabled = ['production', 'staging', 'dev'].includes(process.env.NODE_ENV)

module.exports = () => ({
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
      RECAPTCHA_SITE_KEY: JSON.stringify(process.env.RECAPTCHA_SITE_KEY),
      CAPTCHA_ENABLED: JSON.stringify(Boolean(captchaEnabled)),
      NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      ENABLE_DEV_MSW: JSON.stringify(Boolean(process.env.ENABLE_DEV_MSW)),
      'process.env.ENABLE_DEV_MSW': JSON.stringify(Boolean(process.env.ENABLE_DEV_MSW)),
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
        exclude: [/dist/, /.build_cache/, /\.module\.s(a|c)ss$/],
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.module\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[name]__[local]--[hash:base64:5]',
              },
              esModule: false,
            },
          },
        ],
      },
      {
        test: /\.css$/,
        exclude: /\.module\.css$/,
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
