import { writeHeapSnapshot } from 'v8'
import { createEntrypoint } from './entrypoint'
import { log } from './logger'

process.on('SIGUSR2', () => {
  const fileName = writeHeapSnapshot()
  log.verbose(`Created heap dump file: ${fileName}`)
})

createEntrypoint()()
