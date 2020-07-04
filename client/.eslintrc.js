/* globals module */

module.exports = {
  "env": {
    "browser": true,
    "es6": true,
    "jest": true,
  },
  "parser": "babel-eslint",
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended"
  ],
  "globals": {
    "Atomics": "readonly",
    "SharedArrayBuffer": "readonly"
  },
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    },
    "ecmaVersion": 2018,
    "sourceType": "module"
  },
  "plugins": [
    "react",
    "import",
  ],
  "rules": {
    "comma-dangle": ["error", "always-multiline"],
    "import/newline-after-import": ["error", { "count": 2 }],
    "import/order": [
      "error", { "groups": ["builtin", "external", "internal"], "newlines-between": "always" }
    ],
    "no-prototype-builtins": "off",
    "object-curly-spacing": [
      "error", "always", { "objectsInObjects": false, "arraysInObjects": false },
    ],
    "quotes": [ "error", "single", { "avoidEscape": true } ],
    "semi": ["error", "never"],
  },
  "settings": {
    "react": {
      "version": "detect",
    },
  },
};
