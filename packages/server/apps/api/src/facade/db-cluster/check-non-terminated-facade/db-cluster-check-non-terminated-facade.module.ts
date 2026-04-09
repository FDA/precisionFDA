import { Module } from '@nestjs/common'
import { DbClusterModule } from '@shared/domain/db-cluster/db-cluster.module'
import { EmailModule } from '@shared/domain/email/email.module'
import { DbClusterCheckNonTerminatedFacade } from './db-cluster-check-non-terminated.facade'

@Module({
  imports: [DbClusterModule, EmailModule],
  providers: [DbClusterCheckNonTerminatedFacade],
  exports: [DbClusterCheckNonTerminatedFacade],
})
export class DbClusterCheckNonTerminatedFacadeModule {}
