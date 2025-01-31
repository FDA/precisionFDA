import { initialize, mswLoader } from 'msw-storybook-addon'
import { handlers } from '../src/mocks/handlers'

initialize();

const preview = {
  loaders: [mswLoader],
}

export const parameters = {
  msw: { handlers }
}

export default preview
