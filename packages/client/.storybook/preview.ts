import type { Preview } from '@storybook/react-vite'
import { initialize, mswLoader } from 'msw-storybook-addon'
import { handlers } from '../src/mocks/handlers'
import { resetStorybookQueryClient } from '../src/stories/StorybookProviders'

initialize()

const preview: Preview = {
  loaders: [
    mswLoader,
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
