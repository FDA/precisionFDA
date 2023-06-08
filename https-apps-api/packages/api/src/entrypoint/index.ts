import { database, queue } from '@pfda/https-apps-shared'
import { createServer, KoaCallback } from '../server'
import { log } from '../logger'

// NOTE(samuel) callback parameter is for watch mode, shoutout to `ts-node-dev` (slow variant used up until now)
// callback cannot be passed directly as function arg, as it is updated during runtime
// especially when recompilation occurs
export function createEntrypoint(getAppCallback: () => KoaCallback) {

  let api = null as null | ReturnType<typeof createServer>
  const handleFatalError = (err: Error): void => {
    process.removeAllListeners('uncaughtException')
    process.removeAllListeners('unhandledRejection')

    log.fatal({ error: err }, 'Fatal error occured. Exiting the app')
  }

  const stopAll = async (): Promise<void> => {
    log.info('App closing')

    process.removeAllListeners('SIGTERM')

    // close the services
    if (api) {
      await api.stopServer()
    }
    await database.stop()
    await queue.disconnectQueues()
  }

  const startAll = async (): Promise<void> => {
    api = createServer(getAppCallback())

    process.once('uncaughtException', err => {
      log.error('App crash: Uncaught exception')
      handleFatalError(err)
    })

    process.once('unhandledRejection', err => {
      log.error('App crash: Unhandled rejection')
      handleFatalError(err as Error)
    })

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    process.once('SIGINT', stopAll)
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    process.once('SIGTERM', stopAll)

    // start the services in correct order
    await database.start()
    await queue.createQueues()
    await api.startHttpsServer()
    await api.startWSServer()
  }

  // run it
  return () => startAll().catch(err => handleFatalError(err))
}
