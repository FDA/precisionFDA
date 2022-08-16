module.exports = {
  env: {
    browser: true,
    es6: true,
    jest: true,
  },
  extends: [
    'airbnb',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  "globals": {
    "Atomics": "readonly",
    "SharedArrayBuffer": "readonly",
    "PROD_OR_STAGE": "readonly",
    "RECAPTCHA_SITE_KEY": "readonly",
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: ['react', 'react-hooks', '@typescript-eslint', 'prettier'],
  rules: {
    'no-shadow': 'off',
    'dot-notation': 'off',
    '@typescript-eslint/no-shadow': ['error'],
    '@typescript-eslint/no-empty-function': 'off',
    'camelcase': 'off',
    'react/prop-types': 'off',
    'react/require-default-props': 'off',
    'react/jsx-props-no-spreading': 'off',
    'comma-dangle': ['error', 'always-multiline'],
    'import/extensions': 'off',
    'no-redeclare': 'off',
    'dot-notation': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/function-component-definition': 'off',
    'no-prototype-builtins': 'off',
    'import/prefer-default-export': 'off',
    'react/jsx-filename-extension': [1, { 'extensions': ['.tsx', '.jsx']}],
    'object-curly-spacing': [
      'error', 'always', { 'objectsInObjects': false, 'arraysInObjects': false },
    ],
    'quotes': [ 'error', 'single', { 'avoidEscape': true } ],
    'semi': ['error', 'never'],
  },
  settings: {
    'import/resolver': {
      'typescript': {},
    },
  },
}
