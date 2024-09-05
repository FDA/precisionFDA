import { MySqlDriver } from '@mikro-orm/mysql'
import { MikroOrmModuleSyncOptions } from '@mikro-orm/nestjs/typings'
import { TsMorphMetadataProvider } from '@mikro-orm/reflection'
import { BaseEntity } from '@shared/database/base-entity'
import { entities } from '@shared/database/entities'
import { config } from '@shared/config'

export const mikroOrmConfig: MikroOrmModuleSyncOptions = {
  clientUrl: config.database.clientUrl,
  debug: config.database.debug,
  metadataProvider: TsMorphMetadataProvider,
  entities: [BaseEntity, ...Object.values(entities)],
  driver: MySqlDriver,
  // v5 introduced strict checking. Having this enabled would mean a lot
  // of work, but we need to eventually reach this property to be true
  validateRequired: false,
  // useful for mysql datetime type https://mikro-orm.io/docs/configuration#forcing-utc-timezone
  // this way, created timestamps do not depend on developer's timezone
  // useful for testing database, for example
  forceUtcTimezone: true,
  // entity metadata cache. It has been causing a lot of different issues in the past
  // in case this is ever enabled, make sure to first generate the cache manually via the mikro orm cli (mikro-orm cache:generate)
  // failing to do so often leads to problems while multiple apps boot at the same time and attempt to write the same cache
  metadataCache: { enabled: false },
  // https://jira.internal.dnanexus.com/browse/PFDA-5349
  discovery: { checkDuplicateFieldNames: false },
}
