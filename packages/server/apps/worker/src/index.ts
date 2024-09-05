import { writeHeapSnapshot } from 'v8'
import { bootstrap } from './bootstrap'
import { log } from './utils/logger'

process.on('SIGUSR2', () => {
  const fileName = writeHeapSnapshot()
  log.log(`Created heap dump file: ${fileName}`)
})

bootstrap().then(async (app) => {
  if (process.argv.includes('--shutdown')) {
    await app.close()
    process.exit(0)
  }
})
