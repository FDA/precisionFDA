'use strict'

module.exports = {
  overrides: [],
  rules: {
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/explicit-module-boundary-types': 0,
    '@typescript-eslint/no-warning-comments': 0,
    '@typescript-eslint/prefer-readonly-parameter-types': 0,
    // '@typescript-eslint/promise-function-async': 0,
    // '@typescript-eslint/restrict-template-expressions': 0,
    // 'new-cap': 0,
    'import/no-unused-modules': [1, { unusedExports: true, ignorePaths: ['./src/index.ts'] }],
    // we want to use both types and interfaces
    '@typescript-eslint/consistent-type-definitions': 0,
  },
}
