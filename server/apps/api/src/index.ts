import { createApp } from './server/app'
import { createEntrypoint } from './entrypoint'
import { writeHeapSnapshot } from 'v8'
import { log } from './logger'

process.on('SIGUSR2', () => {
  const fileName = writeHeapSnapshot()
  log.info(`Created heap dump file: ${fileName}`)
})

const app = createApp()
createEntrypoint(() => app.callback())()
