import { writeHeapSnapshot } from 'v8'
import { database, queue } from '@shared'
import { setupHandlers } from './queues'
import { log } from './utils'

process.on('SIGUSR2', () => {
  const fileName = writeHeapSnapshot()
  log.info(`Created heap dump file: ${fileName}`)
})

const stopWorker = async (): Promise<void> => {
  log.info('worker closing')

  process.removeAllListeners('SIGINT')
  process.removeAllListeners('SIGTREM')

  await queue.disconnectQueues()
  await database.stop()
  // eslint-disable-next-line node/no-process-exit
  process.exit(1)
}

const handleFatalError = async (err: Error): Promise<void> => {
  log.fatal({ error: err }, 'Fatal error occurred. Exiting the worker')
  // eslint-disable-next-line node/no-process-exit
  setTimeout(() => process.exit(2), 10000)
  try {
    await stopWorker()
  } catch (err) {
    log.error({ error: err }, 'Error stopping worker')
  }
}

const startWorker = async (): Promise<void> => {
  log.info('worker starting')
  process.once('uncaughtException', err => {
    log.error('Worker crash: Uncaught exception')
    handleFatalError(err)
  })

  process.once('unhandledRejection', err => {
    log.error('Worker crash: Unhandled rejection')
    handleFatalError(err as Error)
  })

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  process.once('SIGINT', async () => await stopWorker())
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  process.once('SIGTERM', async () => await stopWorker())

  // start consuming queues

  await database.start()
  await setupHandlers()
}

Promise.resolve()
  .then(async () => {
    // this is blocking, no other promise is resolved
    await startWorker()
  })
  .catch(err => handleFatalError(err))
