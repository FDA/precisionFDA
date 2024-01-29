import { Global, Module } from '@nestjs/common'
import { DatabaseModule } from '@shared/database/database.module'
import { sqlEntityManagerProvider } from './providers/sql-entity-manager.provider'

@Global()
@Module({
  imports: [DatabaseModule],
  providers: [sqlEntityManagerProvider],
  exports: [sqlEntityManagerProvider],
})
export class DatabaseWorkerModule {}
