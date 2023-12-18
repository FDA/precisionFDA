/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
// @ts-nocheck
import hmr from 'node-hmr'
import { createEntrypoint } from './entrypoint'

let callback
hmr(() => {
  try {
    // Force initialize require cache by requiring everything, skipping this will leave out some modules
    require('./entrypoint')
    const { createApp } = require('./server/app')
    const app = createApp()
    callback = app.callback()
  } catch(e) {

    // Patches TS compilation errors
    if (e.constructor.name === 'TSError') {
      console.error('----- TYPESCRIPT ERROR -----')
      console.error(e.message)
      console.error(e.stack)
      console.error('----- END OF TS ERROR ------')
      console.error(`AFTER FIXING TRIGGER RELOADING BY WRITING INTO THIS FILE - "${__filename}"`)
      return
    }
    throw e
  }
}, {
  // NOTE(samuel) node_modules are automatically ignored in underlying "chokidar" package
  watchFilePatterns: [
    'api/**/*.ts',
    'api/**/*.d.ts',
    'shared/**/*.ts',
    'shared/**/*.d.ts',
  ],
  watchDir: '../../',
  debug: true,
})

// TODO(samuel) add compilation cache for ts for faster dev-image build
// TODO(samuel) add .env watcher to reconfigure api easily
// TODO(samuel) apply for worker as well
// TODO(samuel) possibly unit-test this
// TODO(samuel) possibly even add pre-commit hook, as we're using different tsconfig for actual building
// TODO(samuel) IDEA - watch for entity metadata and reconnect to database when it changes
// TODO(samuel) workaround manual reloading for index-dev.ts

createEntrypoint(() => callback)()

