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
  ],
  plugins: ["@babel/plugin-proposal-class-properties"],
  env: {
    production: {
      plugins: [
        "transform-react-remove-prop-types",
      ],
    },
  },
}
