import { Module } from '@nestjs/common'
import { UsersDbClustersSaltModule } from '@shared/domain/db-cluster/access-control/users-db-clusters-salt.module'
import { DbClusterModule } from '@shared/domain/db-cluster/db-cluster.module'
import { DbClusterPasswordFacade } from './db-cluster-password.facade'
import { DbClusterSynchronizeFacadeModule } from '../synchronize-facade/db-cluster-synchronize-facade.module'

@Module({
  imports: [DbClusterModule, UsersDbClustersSaltModule, DbClusterSynchronizeFacadeModule],
  providers: [DbClusterPasswordFacade],
  exports: [DbClusterPasswordFacade],
})
export class DbClusterPasswordFacadeModule {}
