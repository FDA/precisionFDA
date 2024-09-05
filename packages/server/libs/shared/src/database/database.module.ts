import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Global, Module } from '@nestjs/common'
import { mikroOrmConfig } from '@shared/database/config/mikro-orm.config'
import { deprecatedSqlEntityManagerProvider } from '@shared/database/provider/deprecated-sql-entity-manager.provider'

@Global()
@Module({
  imports: [MikroOrmModule.forRoot(mikroOrmConfig)],
  providers: [deprecatedSqlEntityManagerProvider],
  exports: [deprecatedSqlEntityManagerProvider],
})
export class DatabaseModule {}
