/* globals module*/

module.exports = {
  presets: [
    "@babel/preset-env",
    [
      "@babel/preset-react",
      {
        development: process.env.NODE_ENV !== "production",
      },
    ],
    ["@babel/preset-typescript", { "allExtensions": true, "isTSX": true }],
  ],
  plugins: [
    "@babel/plugin-proposal-class-properties",
    ["@babel/plugin-transform-runtime", { "regenerator": true }]
  ],
  env: {
    production: {
      plugins: [
        "transform-react-remove-prop-types",
      ],
    },
  },
}
