import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Global, Module } from '@nestjs/common'
import { mikroOrmMainConfig } from '@shared/database/config/mikro-orm-main.config'
import { mikroOrmRoConfig } from '@shared/database/config/mikro-orm-ro.config'
import { deprecatedSqlEntityManagerProvider } from '@shared/database/provider/deprecated-sql-entity-manager.provider'
import { readOnlySqlEntityManagerProvider } from '@shared/database/provider/read-only-em.provider'

@Global()
@Module({
  imports: [MikroOrmModule.forRoot(mikroOrmMainConfig), MikroOrmModule.forRoot(mikroOrmRoConfig)],
  providers: [deprecatedSqlEntityManagerProvider, readOnlySqlEntityManagerProvider],
  exports: [deprecatedSqlEntityManagerProvider, readOnlySqlEntityManagerProvider],
})
export class DatabaseModule {}
