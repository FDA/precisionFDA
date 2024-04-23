import { MikroOrmModuleSyncOptions } from '@mikro-orm/nestjs/typings'
import { config } from '@shared/config'
import { mikroOrmBaseConfig } from '@shared/database/config/mikro-orm.config'
import { DatabaseConnectionType } from '@shared/database/domain/database-connection.type'

export const mikroOrmRoConfig: MikroOrmModuleSyncOptions = {
  ...mikroOrmBaseConfig,
  contextName: DatabaseConnectionType.READ_ONLY,
  registerRequestContext: false,
  clientUrl: config.databaseReplica.clientUrl,
  debug: config.databaseReplica.debug,
}
