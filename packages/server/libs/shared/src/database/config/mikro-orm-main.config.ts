import { MikroOrmModuleSyncOptions } from '@mikro-orm/nestjs/typings'
import { config } from '@shared/config'
import { mikroOrmBaseConfig } from '@shared/database/config/mikro-orm.config'

export const mikroOrmMainConfig: MikroOrmModuleSyncOptions = {
  ...mikroOrmBaseConfig,
  clientUrl: config.database.clientUrl,
  debug: config.database.debug,
}
