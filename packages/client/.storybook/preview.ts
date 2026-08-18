import type { Preview } from '@storybook/react-vite'
import { mswLoader } from 'msw-storybook-addon/csf3'
import { handlers } from '../src/mocks/handlers'
import { resetStorybookQueryClient } from '../src/stories/StorybookProviders'

const preview: Preview = {
  loaders: [
    mswLoader(),
    () => {
      resetStorybookQueryClient()
      return {}
    },
  ],
  parameters: {
    msw: { handlers },
  },
}

export default preview
