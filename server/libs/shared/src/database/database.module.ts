import { Global, Module } from '@nestjs/common'
import { deprecatedSqlEntityManagerProvider } from '@shared/database/provider/deprecated-sql-entity-manager.provider'
import { sqlEntityManagerProvider } from '@shared/database/provider/sql-entity-manager.provider'

@Global()
@Module({
  providers: [sqlEntityManagerProvider, deprecatedSqlEntityManagerProvider],
  exports: [sqlEntityManagerProvider, deprecatedSqlEntityManagerProvider],
})
export class DatabaseModule {}
