'use strict'

module.exports = {
  overrides: [
    {
      files: '**/*.routes.ts',
      rules: {
        // updating the ctx raises false positive -> race condition does not happen there
        'require-atomic-updates': 0,
      },
    },
  ],
  rules: {
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/explicit-module-boundary-types': 0,
    '@typescript-eslint/promise-function-async': 0,
    'new-cap': 0,
    'id-length': 0,
    'import/no-unused-modules': [1, { unusedExports: true, ignorePaths: ['./src/index.ts'] }],
    // does not play well with koa.context
    '@typescript-eslint/prefer-readonly-parameter-types': 0,
    '@typescript-eslint/no-unnecessary-condition': 0,
    // we want to use both types and interfaces
    '@typescript-eslint/consistent-type-definitions': 0,
    '@typescript-eslint/restrict-template-expressions': 0,
    'import/group-exports': 0,
    '@typescript-eslint/no-floating-promises': 0,
  },
}
