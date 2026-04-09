import { MikroORM } from '@mikro-orm/core'
import { MySqlDriver } from '@mikro-orm/mysql'
import { INestApplication, INestApplicationContext } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { Logger } from 'nestjs-pino'
import { database } from '@shared/database'
import { createQueues } from '@shared/queue'
import { QueueModule } from '@shared/queue/queue.module'
import { QueueProxy } from '@shared/queue/queue.proxy'

export async function setupNestApp(app: INestApplicationContext) {
  app.enableShutdownHooks()

  app.useLogger(app.get(Logger))

  await exposeModules(app)
}

/**
 * Used to expose NestJs DI integrated modules to the parts of the codebase, that are not integrated into the DI yet.
 * Should be removed when everything is DI integrated
 */
async function exposeModules(app: INestApplicationContext) {
  exposeOrm(app)
  await exposeBull(app.select(QueueModule))
}

export function exposeOrm(app: INestApplicationContext) {
  const mainORM: MikroORM<MySqlDriver> = app.get(MikroORM)
  database.init(mainORM)
}

async function exposeBull(app: INestApplicationContext) {
  const queueProvider = app.get(QueueProxy)
  await createQueues(queueProvider)
}

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('precisionFDA API')
    .setDescription('OpenAPI documentation for precisionFDA API')
    .setVersion('1.0')
    .addCookieAuth('_precision-fda_session', {
      type: 'apiKey',
      in: 'cookie',
      name: '_precision-fda_session',
    })
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
    customSiteTitle: 'precisionFDA API Docs',
  })
}
