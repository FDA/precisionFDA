import { createApp } from './server/app'
import { createEntrypoint } from './entrypoint'

const app = createApp()
createEntrypoint(() => app.callback())()
