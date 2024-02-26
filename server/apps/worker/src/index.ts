import { writeHeapSnapshot } from 'v8'
import { bootstrap } from './bootstrap'
import { log } from './utils/logger'

process.on('SIGUSR2', () => {
  const fileName = writeHeapSnapshot()
  log.verbose(`Created heap dump file: ${fileName}`)
})

bootstrap()
