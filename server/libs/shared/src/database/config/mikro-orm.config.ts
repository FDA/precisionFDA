import { MikroOrmModuleSyncOptions } from '@mikro-orm/nestjs/typings'
import { TsMorphMetadataProvider } from '@mikro-orm/reflection'
import { config } from '@shared/config'
import { BaseEntity } from '@shared/database/base-entity'
import { entities } from '@shared/database/entities'

export const mikroOrmBaseConfig: MikroOrmModuleSyncOptions = {
  metadataProvider: TsMorphMetadataProvider,
  entities: [BaseEntity, ...Object.values(entities)],
  type: 'mysql',
  // v5 introduced strict checking. Having this enabled would mean a lot
  // of work, but we need to eventually reach this property to be true
  validateRequired: false,
  // useful for mysql datetime type https://mikro-orm.io/docs/configuration#forcing-utc-timezone
  // this way, created timestamps do not depend on developer's timezone
  // useful for testing database, for example
  forceUtcTimezone: true,
  cache: { enabled: config.database.ormCacheEnabled },
}
