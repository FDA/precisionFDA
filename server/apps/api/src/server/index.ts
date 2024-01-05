import { INestApplication } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { config, queue } from '@shared'
import { ENVS } from '@shared/enums'
import { QueueModule } from '@shared/queue/queue.module'
import { QueueProxy } from '@shared/queue/queue.proxy'
import fs from 'fs'
import { Logger } from 'nestjs-pino'
import { ApiModule } from '../api.module'
import { log } from '../logger'
import { setupWSServer } from './middleware/notifications'

// the null type here is "ignored" because in allow-strict-null-checks = false mode
// it is considered a subtype of T
// we can consider using the strict null checks option
let app: null | INestApplication = null
let wss: any = null

export const getServer = () => app.getHttpServer()

export function createServer() {
  const startWSServer = async (): Promise<void> => {
    if (app !== null) {
      wss = await setupWSServer(app.getHttpServer())
      log.log('WebSocket server initialized')
    }
  }

  const startHttpServer = async (): Promise<void> => {
    app = await NestFactory.create(ApiModule)
    await app.listen(config.api.port)

    if (config.env !== ENVS.LOCAL) {
      app.useLogger(app.get(Logger))
    }

    const queueProvider = app.select(QueueModule).get(QueueProxy)
    await queue.createQueues(queueProvider)

    log.log(`HTTP Server: started (port: ${config.api.port.toString()})`)
  }

  const startHttpsServer = async (): Promise<void> => {
    // Uncomment to debug server config
    // log.log({config: config} , 'HTTP Server config')

    app = await NestFactory.create(ApiModule, {
      httpsOptions: {
        key: fs.readFileSync(config.api.keyCertPath),
        cert: fs.readFileSync(config.api.certPath),
      },
    })

    if (config.env !== ENVS.LOCAL) {
      app.useLogger(app.get(Logger))
    }

    const queueProvider = app.select(QueueModule).get(QueueProxy)
    await queue.createQueues(queueProvider)

    await app.listen(config.api.port)

    log.log(`HTTPS Server: started (port: ${config.api.port.toString()})`)
  }

  const stopServer = async (): Promise<void> => {
    await new Promise<void>((resolve) => {
      if (!wss) {
        resolve()
        return
      }

      wss.close(resolve)
    })
    log.log('WebSocket server closed')

    await app?.close()
    log.log('Server: closed')
  }

  return {
    startHttpsServer,
    startHttpServer,
    startWSServer,
    stopServer,
  }
}
