import { INestApplication } from '@nestjs/common'
import { NestApplicationOptions } from '@nestjs/common/interfaces/nest-application-options.interface'
import { NestFactory } from '@nestjs/core'
import { setupNestApp } from '@shared/app-initialization'
import { config } from '@shared/config'
import fs from 'fs'
import { ApiModule } from '../api.module'
import { log } from '../logger'
import { setupWSServer } from './middleware/notifications'

// the null type here is "ignored" because in allow-strict-null-checks = false mode
// it is considered a subtype of T
// we can consider using the strict null checks option
let app: null | INestApplication = null
let wss: any = null

export const getServer = () => app.getHttpServer()

const startApp = async (cfg: { ssl: boolean }) => {
  const options: NestApplicationOptions = {}

  if (cfg?.ssl) {
    options.httpsOptions = {
      key: fs.readFileSync(config.api.keyCertPath),
      cert: fs.readFileSync(config.api.certPath),
    }
  }

  app = await NestFactory.create(ApiModule, options)

  await setupNestApp(app)

  await app.listen(config.api.port)

  log.log(`${cfg?.ssl ? 'HTTPS' : 'HTTP'} Server: started (port: ${config.api.port.toString()})`)
}

export function createServer() {
  const startWSServer = async (): Promise<void> => {
    if (app !== null) {
      wss = await setupWSServer(app.getHttpServer())
      log.log('WebSocket server initialized')
    }
  }

  const startHttpServer = async (): Promise<void> => {
    await startApp({ ssl: false })
  }

  const startHttpsServer = async (): Promise<void> => {
    // Uncomment to debug server config
    // log.log({config: config} , 'HTTP Server config')

    await startApp({ ssl: true })
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
