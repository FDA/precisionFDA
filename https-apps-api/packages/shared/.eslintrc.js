'use strict'

module.exports = {
  overrides: [
    {
      files: ['*.d.ts'],
      rules: {},
    },
  ],
  rules: {
    '@typescript-eslint/prefer-readonly-parameter-types': 0,
    '@typescript-eslint/consistent-type-definitions': 0,
    // does not work for decorators
    'new-cap': 0,
  },
}
