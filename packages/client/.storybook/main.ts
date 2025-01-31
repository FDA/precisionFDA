
import type { StorybookConfig } from '@storybook/react-webpack5'

const config: StorybookConfig = {
  'stories': [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(js|jsx|ts|tsx)'
  ],
  'addons': [
    '@storybook/addon-webpack5-compiler-swc'
  ],
  'framework': {
    'name': '@storybook/react-webpack5',
    'options': {}
  },
  'env': (config) => ({
    ...config,
    'ENABLE_DEV_MSW': 'true'
  }),
  'staticDirs': ['../public'],
}

export default config
