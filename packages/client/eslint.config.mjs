// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import eslint from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import eslintPluginImport from 'eslint-plugin-import'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import eslintPluginReact from 'eslint-plugin-react'
import * as reactHooks from 'eslint-plugin-react-hooks'
import storybook from 'eslint-plugin-storybook'
import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  eslintPluginReact.configs.flat['jsx-runtime'],
  eslintPluginReact.configs.flat['recommended'],
  jsxA11y.flatConfigs.recommended,
  eslintConfigPrettier,
  {
    plugins: { 'react-hooks': reactHooks, import: eslintPluginImport },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-shadow': 'off',
      'dot-notation': 'off',
      '@typescript-eslint/no-shadow': ['error'],
      '@typescript-eslint/no-empty-function': 'off',
      camelcase: 'off',
      'react/prop-types': 'off',
      'react/require-default-props': 'off',
      'react/jsx-props-no-spreading': 'off',
      'jsx-a11y/label-has-associated-control': 'off',
      'no-redeclare': 'off',
      'no-plusplus': 'off',
      'import/no-unresolved': 'error',
      'import/no-cycle': 'warn',
      'import/no-self-import': 'error',
      'react/function-component-definition': 'off',
      'react/destructuring-assignment': 'off',
      'no-prototype-builtins': 'off',
      'arrow-body-style': 'off',
      'react/jsx-filename-extension': [1, { extensions: ['.tsx', '.jsx'] }],
      'no-param-reassign': [
        2,
        {
          props: false,
        },
      ],
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: {},
      },
    },
  },
  {
    ignores: ['src/features/lexi/**/*'],
  },
  storybook.configs['flat/recommended'],
)
