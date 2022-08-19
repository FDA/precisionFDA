'use strict'

module.exports = {
  extends: ['@strv/eslint-config-node/v10', '@strv/eslint-config-node/optional'],

  overrides: [
    {
      files: '**/*.ts',
      extends: ['@strv/eslint-config-typescript', '@strv/eslint-config-typescript/style'],
      parserOptions: {
        project: './tsconfig.json',
      },
      rules: {
        '@typescript-eslint/naming-convention': 0,
      },
    },
    {
      files: ['*.d.ts'],
      rules: {
        // imports are used to create types but eslint cannot process that
        '@typescript-eslint/no-unused-vars': 0,
        'import/no-unused-modules': 0,
        'id-lenght': 0,
      },
    },
  ],
  rules: {
    'import/group-exports': 0,
  }
}
