import { database, queue } from '@pfda/https-apps-shared'
import { setupHandlers } from './queues'
import { log } from './utils'

const handleFatalError = (err: Error): void => {
  process.removeAllListeners('uncaughtException')
  process.removeAllListeners('unhandledRejection')

  log.fatal({ error: err }, 'Fatal error occured. Exiting the worker')
}

const stopWorker = async (): Promise<void> => {
  log.info('worker closing')

  process.removeAllListeners('SIGINT')
  process.removeAllListeners('SIGTREM')

  await queue.disconnectQueues()
  await database.stop()
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
  process.once('SIGINT', () => stopWorker())
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  process.once('SIGTERM', () => stopWorker())

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
