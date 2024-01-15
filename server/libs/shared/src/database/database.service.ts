import { TsMorphMetadataProvider } from '@mikro-orm/reflection'
import { Connection, MikroORM } from '@mikro-orm/core'
import { config } from '@shared'
import { defaultLogger as log } from '../logger'
import { entities } from '../domain'
import { BaseEntity } from './base-entity'
import { MySqlDriver } from '@mikro-orm/mysql'

export interface IDatabaseService {
  getOrm(): MikroORM<MySqlDriver> | null
  getConnection(): Connection
  start(): void
  stop(): void
}

// Migrated code from database/index.ts to be class-based.
// Currently only used only for read replica
// TODO replaced singleton pattern in database/index.ts
//
export class DatabaseService implements IDatabaseService {
  clientUrl: string
  debug: boolean
  orm: MikroORM<MySqlDriver> | null

  constructor(clientUrl: string, debug: boolean) {
    this.clientUrl = clientUrl
    this.debug = debug
  }

  async start(): Promise<void> {
    try {
      this.orm = await MikroORM.init({
        metadataProvider: TsMorphMetadataProvider,
        entities: [BaseEntity, ...Object.values(entities)],
        type: 'mysql',
        clientUrl: this.clientUrl,
        debug: this.debug,
        // v5 introduced strict checking. Having this enabled would mean a lot
        // of work, but we need to eventually reach this property to be true
        validateRequired: false,
        // useful for mysql datetime type https://mikro-orm.io/docs/configuration#forcing-utc-timezone
        // this way, created timestamps do not depend on developer's timezone
        // useful for testing database, for example
        forceUtcTimezone: true,
        cache: { enabled: config.database.ormCacheEnabled },
      })
      log.debug('DatabaseService: connection')
      await this.orm.em.getConnection().execute('SELECT 1+1 as foo;')
    } catch (err) {
      log.error({ err }, 'DatabaseService connection failed')
      // not suitable here, but good for tests
      // throw new errors.InternalError('DatabaseService connection failed')
      throw err
    }
  }

  async stop(): Promise<void> {
    try {
      if (this.orm && (await this.orm.isConnected())) {
        await this.orm.close()
      }
      log.debug('DatabaseService: connection stopped')
    } catch (err) {
      log.error({ err }, 'DatabaseService connection: stop failed')
      throw err
    }
  }

  getOrm() {
    return this.orm
  }

  getConnection() {
    return this.orm!.em.getConnection()
  }
}
