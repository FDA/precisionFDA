import { NestFactory } from '@nestjs/core'
import { setupNestApp } from '@shared/app-initialization'
import { config } from '@shared/config'
import { logQueueStatus } from '@shared/queue'
import { log } from './utils/logger'
import { WorkerModule } from './worker.module'

export async function bootstrap() {
  log.log('worker starting')

  const app = await NestFactory.createApplicationContext(WorkerModule, {
    snapshot: config.nestjsDevtoolsEnabled,
  })

  await setupNestApp(app)
  await logQueueStatus()

  await app.init()

  log.log('worker started successfully')

  return app
}
