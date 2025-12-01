import { Module } from '@nestjs/common'
import { SpaceModule } from '@shared/domain/space/space.module'
import { DbClusterModule } from '@shared/domain/db-cluster/db-cluster.module'
import { DbClusterGetFacade } from './db-cluster-get.facade'
import { SpaceMembershipModule } from '@shared/domain/space-membership/space-membership.module'

@Module({
  imports: [DbClusterModule, SpaceModule, SpaceMembershipModule],
  providers: [DbClusterGetFacade],
  exports: [DbClusterGetFacade],
})
export class DbClusterGetFacadeModule {}
