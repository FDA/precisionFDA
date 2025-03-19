// @ts-check
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import eslintPluginReact from 'eslint-plugin-react'
import * as reactHooks from 'eslint-plugin-react-hooks'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import eslintConfigPrettier from 'eslint-config-prettier'

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  eslintPluginReact.configs.flat['jsx-runtime'],
  eslintPluginReact.configs.flat['recommended'],
  jsxA11y.flatConfigs.recommended,
  eslintConfigPrettier,
  {
    plugins: { 'react-hooks': reactHooks },
    rules: {
      // '@typescript-eslint/no-explicit-any': 'off',
      // '@typescript-eslint/no-unused-vars': 'off',
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
      'no-redeclare': 'off',
      'no-plusplus': 'off',
      'react/function-component-definition': 'off',
      'react/destructuring-assignment': 'off',
      'no-prototype-builtins': 'off',
      'arrow-body-style': 'off',
      'react/jsx-filename-extension': [1, { extensions: ['.tsx', '.jsx']}],
      'object-curly-spacing': ['error', 'always', { objectsInObjects: false, arraysInObjects: false }],
      'no-param-reassign': [
        2,
        {
          props: false,
        },
      ],
      quotes: ['error', 'single', { avoidEscape: true }],
      semi: ['error', 'never'],
    },
    settings: {
      'import/resolver': {
        typescript: {},
      },
    },
  },
  {
    ignores: ['src/features/lexi/**/*'],
  },
)
