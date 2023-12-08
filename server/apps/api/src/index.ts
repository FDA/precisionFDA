import { createApp } from './server/app'
import { createEntrypoint } from './entrypoint'
import { writeHeapSnapshot } from 'v8'
import { log } from './logger'
import { database } from '@shared'

process.on('SIGUSR2', () => {
  const fileName = writeHeapSnapshot()
  log.info(`Created heap dump file: ${fileName}`)
})

database
  .start()
  .then(() => {
    const app = createApp()
    createEntrypoint(() => app.callback())()
  })
  .catch((e) => {
    log.error(`Error while creating the database service: ${e.message}`)
  })
