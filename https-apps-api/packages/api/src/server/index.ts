import http from 'http'
import https from 'https'
import fs from 'fs'
import { config } from '@pfda/https-apps-shared'
import { log } from '../logger'
import { createApp } from './app'

export type KoaCallback = ReturnType<ReturnType<typeof createApp>['callback']>

// the null type here is "ignored" because in allow-strict-null-checks = false mode
// it is considered a subtype of T
// we can consider using the strict null checks option
let server: null | http.Server = null

export const getServer = () => server

export function createServer(callback: KoaCallback) {
  const startHttpServer = async (): Promise<void> => {
    await new Promise(resolve => {
      const startedServer = http
        .createServer(callback)
        .listen(config.api.port, resolve as () => void)
      server = startedServer
    })
    log.info(`HTTP Server: started (port: ${config.api.port.toString()})`)
  }

  const startHttpsServer = async (): Promise<void> => {
    // Uncomment to debug server config
    // log.info({config: config} , 'HTTP Server config')

    await new Promise(resolve => {
      const startedServer = https
        .createServer(
          {
            // eslint-disable-next-line no-sync
            key: fs.readFileSync(config.api.keyCertPath),
            // eslint-disable-next-line no-sync
            cert: fs.readFileSync(config.api.certPath),
          },
          callback,
        )
        .listen(config.api.port, resolve as () => void)
      server = startedServer
    })
    log.info(`HTTPS Server: started (port: ${config.api.port.toString()})`)
  }

  const stopServer = async (): Promise<void> => {
    if (server?.listening) {
      await new Promise(done => server.close(done))
    }
    log.info('Server: closed')
  }

  return {
    startHttpsServer,
    startHttpServer,
    stopServer
  }
}
