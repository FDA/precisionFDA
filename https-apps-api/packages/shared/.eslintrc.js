'use strict'

module.exports = {
  overrides: [
    {
      files: ['*.d.ts'],
      rules: {},
    },
  ],
  rules: {
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/explicit-module-boundary-types': 0,
    '@typescript-eslint/prefer-readonly-parameter-types': 0,
    '@typescript-eslint/consistent-type-definitions': 0,
    '@typescript-eslint/no-warning-comments': 0,
    '@typescript-eslint/promise-function-async': 0,
    '@typescript-eslint/member-ordering': 0,
    '@typescript-eslint/no-unnecessary-condition': 0,
    '@typescript-eslint/no-floating-promises': 0,
    '@typescript-eslint/return-await': 0,
    'import/group-exports': 0,
    'import/exports-last': 0,
    // does not work for decorators
    'new-cap': 0,
    'id-length': 0,
    'allow-parens': 0,
    'max-len': [
      "error",
      {
        "code": 130,
        "tabWidth": 2,
        "ignoreComments": true,
        "ignoreUrls": true,
        "ignoreStrings": true,
        "ignoreTemplateLiterals": true
      }
    ]
  },
}
