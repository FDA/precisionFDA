import { Module } from '@nestjs/common'
import { SpaceModule } from '@shared/domain/space/space.module'
import { DbClusterModule } from '@shared/domain/db-cluster/db-cluster.module'
import { DbClusterListFacade } from './db-cluster-list.facade'
import { SpaceMembershipModule } from '@shared/domain/space-membership/space-membership.module'

@Module({
  imports: [DbClusterModule, SpaceModule, SpaceMembershipModule],
  providers: [DbClusterListFacade],
  exports: [DbClusterListFacade],
})
export class DbClusterListFacadeModule {}
