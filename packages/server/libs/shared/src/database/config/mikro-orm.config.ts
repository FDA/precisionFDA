import { MySqlDriver } from '@mikro-orm/mysql'
import { MikroOrmModuleSyncOptions } from '@mikro-orm/nestjs/typings'
import { TsMorphMetadataProvider } from '@mikro-orm/reflection'
import { config } from '@shared/config'

export interface MikroOrmConfigOptions {
  distPath: string
  sourcePath: string
}

export function getMikroOrmConfig(opts: MikroOrmConfigOptions): MikroOrmModuleSyncOptions {
  return {
    clientUrl: config.database.clientUrl,
    debug: config.database.debug,
    metadataProvider: TsMorphMetadataProvider,
    entities: [getEntityGlob(opts.distPath, 'js')],
    entitiesTs: [getEntityGlob(opts.sourcePath, 'ts'), getEntityGlob('./libs/shared/src', 'ts')],
    driver: MySqlDriver,
    // v5 introduced strict checking. Having this enabled would mean a lot
    // of work, but we need to eventually reach this property to be true
    validateRequired: false,
    // useful for mysql datetime type https://mikro-orm.io/docs/configuration#forcing-utc-timezone
    // this way, created timestamps do not depend on developer's timezone
    // useful for testing database, for example
    forceUtcTimezone: true,
    metadataCache: { enabled: config.database.ormMetadataCacheEnabled },
    // https://jira.internal.dnanexus.com/browse/PFDA-5349
    discovery: { checkDuplicateFieldNames: false },
  }
}

function getEntityGlob(path: string, ext: string) {
  return `${path}/**/*.entity.${ext}`
}
