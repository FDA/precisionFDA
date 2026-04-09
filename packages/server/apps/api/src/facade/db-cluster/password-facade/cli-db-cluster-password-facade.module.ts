import { Module } from '@nestjs/common'
import { UsersDbClustersSaltModule } from '@shared/domain/db-cluster/access-control/users-db-clusters-salt.module'
import { DbClusterModule } from '@shared/domain/db-cluster/db-cluster.module'
import { DbClusterSynchronizeFacadeModule } from '../synchronize-facade/db-cluster-synchronize-facade.module'
import { CliDbClusterPasswordFacade } from './cli-db-cluster-password.facade'

@Module({
  imports: [DbClusterModule, UsersDbClustersSaltModule, DbClusterSynchronizeFacadeModule],
  providers: [CliDbClusterPasswordFacade],
  exports: [CliDbClusterPasswordFacade],
})
export class CliDbClusterPasswordFacadeModule {}
