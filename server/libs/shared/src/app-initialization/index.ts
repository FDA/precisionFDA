import { MikroORM } from '@mikro-orm/core'
import { MySqlDriver } from '@mikro-orm/mysql'
import { getMikroORMToken } from '@mikro-orm/nestjs'
import { INestApplicationContext } from '@nestjs/common'
import { database } from '@shared/database'
import { DatabaseModule } from '@shared/database/database.module'
import { DatabaseConnectionType } from '@shared/database/domain/database-connection.type'
import { createQueues } from '@shared/queue'
import { QueueModule } from '@shared/queue/queue.module'
import { QueueProxy } from '@shared/queue/queue.proxy'
import { Logger } from 'nestjs-pino'

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
  exposeOrm(app.select(DatabaseModule))
  await exposeBull(app.select(QueueModule))
}

export function exposeOrm(app: INestApplicationContext) {
  const mainORM: MikroORM<MySqlDriver> = app.get(MikroORM)
  const roORM = app.get(getMikroORMToken(DatabaseConnectionType.READ_ONLY))
  database.init(mainORM, roORM)
}

async function exposeBull(app: INestApplicationContext) {
  const queueProvider = app.get(QueueProxy)
  await createQueues(queueProvider)
}
