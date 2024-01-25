import { NestFactory } from '@nestjs/core'
import { setupNestApp } from '@shared/app-initialization'
import { logQueueStatus } from '@shared/queue'
import { writeHeapSnapshot } from 'v8'
import { log } from './utils/logger'
import { WorkerModule } from './worker.module'

process.on('SIGUSR2', () => {
  const fileName = writeHeapSnapshot()
  log.verbose(`Created heap dump file: ${fileName}`)
})

const stopWorker = async (): Promise<void> => {
  log.verbose('worker closing')

  process.removeAllListeners('SIGINT')
  process.removeAllListeners('SIGTREM')

  // eslint-disable-next-line node/no-process-exit
  process.exit(1)
}

const handleFatalError = async (err: Error): Promise<void> => {
  log.fatal(err, 'Fatal error occurred. Exiting the worker')
  // eslint-disable-next-line node/no-process-exit
  setTimeout(() => process.exit(2), 10000)
  try {
    await stopWorker()
  } catch (err) {
    log.error(err, 'Error stopping worker')
  }
}

export const startWorker = async (): Promise<void> => {
  log.verbose('worker starting')
  process.once('uncaughtException', (err) => {
    log.error('Worker crash: Uncaught exception')
    handleFatalError(err)
  })

  process.once('unhandledRejection', (err) => {
    log.error('Worker crash: Unhandled rejection')
    handleFatalError(err as Error)
  })

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  process.once('SIGINT', async () => await stopWorker())
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  process.once('SIGTERM', async () => await stopWorker())

  // start consuming queues
  const app = await NestFactory.createApplicationContext(WorkerModule)

  await setupNestApp(app)
  await logQueueStatus()

  await app.init()
}

Promise.resolve()
  .then(async () => {
    // this is blocking, no other promise is resolved
    await startWorker()
  })
  .catch((err) => handleFatalError(err))
