import { initialize, mswLoader } from 'msw-storybook-addon'
import { themes } from '@storybook/theming'
import { handlers } from '../src/mocks/handlers'

export const parameters = {
  docs: {
    theme: themes.light,
  },
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  msw: {
    handlers
  }
}

initialize();

export const loaders = [mswLoader]
