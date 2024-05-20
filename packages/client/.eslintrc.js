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
  'globals': {
    'Atomics': 'readonly',
    'SharedArrayBuffer': 'readonly',
    'PROD_OR_STAGE': 'readonly',
    'RECAPTCHA_SITE_KEY': 'readonly',
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
  ignorePatterns: ['/src/features/lexi/**/*'],
  rules: {
    'no-shadow': 'off',
    'dot-notation': 'off',
    '@typescript-eslint/no-shadow': ['error'],
    '@typescript-eslint/no-empty-function': 'off',
    'camelcase': 'off',
    'react/prop-types': 'off',
    'react/require-default-props': 'off',
    'react/jsx-props-no-spreading': 'off',
    'jsx-a11y/label-has-associated-control': 'off',
    'comma-dangle': ['error', 'always-multiline'],
    'import/extensions': 'off',
    'no-redeclare': 'off',
    'no-plusplus': 'off',
    'react/function-component-definition': 'off',
    'react/destructuring-assignment': 'off',
    'no-prototype-builtins': 'off',
    'arrow-body-style': 'off',
    'import/prefer-default-export': 'off',
    'react/jsx-filename-extension': [1, { 'extensions': ['.tsx', '.jsx']}],
    'import/no-extraneous-dependencies': ['error', { 'devDependencies': ['**/*.test.{ts,tsx,js,jsx}', '**/*/webpack.*.config.js']}],
    'object-curly-spacing': [
      'error', 'always', { 'objectsInObjects': false, 'arraysInObjects': false },
    ],
    'no-param-reassign': [2, { 
      'props': false,
    }],
    'quotes': [ 'error', 'single', { 'avoidEscape': true } ],
    'semi': ['error', 'never'],
  },
  settings: {
    'import/resolver': {
      'typescript': {},
    },
  },
}
