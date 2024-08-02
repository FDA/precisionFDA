import { NestApplicationOptions } from '@nestjs/common/interfaces/nest-application-options.interface'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { setupNestApp } from '@shared/app-initialization'
import { config } from '@shared/config'
import { CustomValidationPipe } from '@shared/validation/pipes/validation.pipe'
import { WebsocketAdapter } from '@shared/websocket/adapter/websocket.adapter'
import fs from 'fs'
import { ApiModule } from './api.module'
import { log } from './logger'

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

  const app = await NestFactory.create<NestExpressApplication>(ApiModule, options)
  app.useWebSocketAdapter(new WebsocketAdapter(app))
  app.useBodyParser('json', { limit: '16mb' })
  await setupNestApp(app)

  app.useGlobalPipes(new CustomValidationPipe({ transform: true }))
  await app.listen(config.api.port)

  log.log(`${enableSsl ? 'HTTPS' : 'HTTP'} Server: started (port: ${config.api.port.toString()})`)

  return app
}
