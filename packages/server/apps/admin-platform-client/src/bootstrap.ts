import { NestFactory } from '@nestjs/core'
import { CustomValidationPipe } from '@shared/validation/pipes/validation.pipe'
import { WebsocketAdapter } from '@shared/websocket/adapter/websocket.adapter'
import { Logger } from 'nestjs-pino'
import { AdminPlatformClientModule } from './admin-platform-client.module'

export async function bootstrap() {
  const app = await NestFactory.create(AdminPlatformClientModule)
  app.enableShutdownHooks()
  app.useLogger(app.get(Logger))
  app.useGlobalPipes(new CustomValidationPipe({ transform: true }))
  app.useWebSocketAdapter(new WebsocketAdapter(app))
  await app.listen(process.env.NODE_ADMIN_PLATFORM_CLIENT_PORT || 3002)

  return app
}
