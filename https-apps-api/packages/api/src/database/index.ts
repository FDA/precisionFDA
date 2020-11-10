import { TsMorphMetadataProvider } from '@mikro-orm/reflection'
import { MikroORM } from '@mikro-orm/core'
import { config } from '@pfda/https-apps-shared'
import { log } from '../logger'
import { App } from '../apps'
import { User } from '../users'
import { Job } from '../jobs'
import { BaseEntity } from './base-entity'

let orm: MikroORM | null

const start = async () => {
  try {
    orm = await MikroORM.init({
      metadataProvider: TsMorphMetadataProvider,
      entities: [BaseEntity, App, User, Job],
      type: 'mysql',
      dbName: config.database.dbName,
      clientUrl: config.database.clientUrl,
      debug: config.database.debug,
      // useful for mysql datetime type https://mikro-orm.io/docs/configuration#forcing-utc-timezone
      // this way, created timestamps do not depend on developer's timezone
      // useful for testing database, for example
      forceUtcTimezone: true,
    })
    log.debug('Database: connection')
    await orm.em.getConnection().execute('SELECT 1+1 as foo;')
    return orm
  } catch (err) {
    log.error({ err }, 'Database connection failed')
    // not suitable here, but good for tests
    // throw new errors.InternalError('Database connection failed')
    throw err
  }
}

const stop = async () => {
  try {
    if (orm && (await orm.isConnected())) {
      await orm.close()
    }
    log.debug('Database: connection stopped')
  } catch (err) {
    log.error({ err }, 'Database connection: stop failed')
    throw err
  }
}

export const database = {
  start,
  stop,
  orm: () => orm,
  connection: () => orm.em.getConnection(),
}
