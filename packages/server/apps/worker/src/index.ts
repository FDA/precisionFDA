import { EventEmitter } from 'node:events'
import { writeHeapSnapshot } from 'node:v8'
import { bootstrap } from './bootstrap'
import { log } from './utils/logger'

// MainQueueProcessor and MaintenanceQueueProcessor each register 11 named @Process handlers
// on their respective Bull queues. During NestJS init, BullExplorer calls queue.process() for
// each handler, which invokes utils.isRedisReady(bclient) internally. Since all 11 calls fire
// before the bclient Redis connection is ready, each adds a once('end') listener to the same
// EventEmitter instance. 11 > default limit of 10 → MaxListenersExceededWarning.
// Setting 25 gives comfortable headroom above the current maximum of 11.
EventEmitter.defaultMaxListeners = 25

process.on('SIGUSR2', () => {
  const fileName = writeHeapSnapshot()
  log.log(`Created heap dump file: ${fileName}`)
})

bootstrap().then(async app => {
  if (process.argv.includes('--shutdown')) {
    await app.close()
    process.exit(0)
  }
})
