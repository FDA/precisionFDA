import { database } from '@pfda/https-apps-shared'
import { api } from './server'
import { log } from './logger'

const handleFatalError = (err: Error): void => {
  process.removeAllListeners('uncaughtException')
  process.removeAllListeners('unhandledRejection')

  log.fatal({ err }, 'Fatal error occured. Exiting the app')
}

const stopAll = async (): Promise<void> => {
  log.info('App closing')

  process.removeAllListeners('SIGINT')
  process.removeAllListeners('SIGTERM')

  // close the services
  await api.stopServer()
  await database.stop()
}

const startAll = async (): Promise<void> => {
  process.once('uncaughtException', err => {
    log.error('App crash: Uncaught exception')
    handleFatalError(err)
  })

  process.once('unhandledRejection', err => {
    log.error('App crash: Unhandled rejection')
    handleFatalError(err as Error)
  })

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  process.once('SIGINT', () => stopAll())
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  process.once('SIGTERM', () => stopAll())

  // start the services in correct order
  await database.start()
  await api.startHttpsServer()
}

// run it
Promise.resolve()
  .then(() => startAll())
  .catch(err => handleFatalError(err))
