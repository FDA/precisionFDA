import { ValidationPipe } from '@nestjs/common'
import { NestApplicationOptions } from '@nestjs/common/interfaces/nest-application-options.interface'
import { NestFactory } from '@nestjs/core'
import { setupNestApp } from '@shared/app-initialization'
import { config } from '@shared/config'
import fs from 'fs'
import { ApiModule } from './api.module'
import { log } from './logger'
import { WebsocketAdapter } from './websocket/adapter/websocket.adapter'

export async function bootstrap() {
  const enableSsl = config.api.enableSsl
  const options: NestApplicationOptions = {
    snapshot: config.nestjsDevtoolsEnabled,
  }

  if (enableSsl) {
    options.httpsOptions = {
      key: fs.readFileSync(config.api.keyCertPath),
      cert: fs.readFileSync(config.api.certPath),
    }
  }

  const app = await NestFactory.create(ApiModule, options)
  app.useWebSocketAdapter(new WebsocketAdapter(app))

  await setupNestApp(app)

  app.useGlobalPipes(new ValidationPipe({ transform: true }))

  await app.listen(config.api.port)

  log.log(`${enableSsl ? 'HTTPS' : 'HTTP'} Server: started (port: ${config.api.port.toString()})`)

  return app
}
