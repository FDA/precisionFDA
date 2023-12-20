import { addons } from '@storybook/manager-api'
import { themes } from '@storybook/theming'

addons.setConfig({
  theme: themes.light,
})

module.exports = {
  'stories': [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(js|jsx|ts|tsx)'
  ],
  'addons': [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    'storybook-addon-swc'
  ],
  'framework': {
    'name': '@storybook/react-webpack5',
    'options': {}
  },
  'staticDirs': ['../public'],
  'docs': {
    'autodocs': 'tag'
  }
}
