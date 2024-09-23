import { MikroOrmModule } from '@mikro-orm/nestjs'
import { DynamicModule, Global, Module } from '@nestjs/common'
import { getMikroOrmConfig, MikroOrmConfigOptions } from '@shared/database/config/mikro-orm.config'
import { deprecatedSqlEntityManagerProvider } from '@shared/database/provider/deprecated-sql-entity-manager.provider'

@Global()
@Module({})
export class DatabaseModule {
  static forRoot(opts: MikroOrmConfigOptions): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [MikroOrmModule.forRoot(getMikroOrmConfig(opts))],
      providers: [deprecatedSqlEntityManagerProvider],
      exports: [deprecatedSqlEntityManagerProvider],
    }
  }
}
