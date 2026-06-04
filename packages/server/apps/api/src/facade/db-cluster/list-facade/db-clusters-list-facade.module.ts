import { Module } from '@nestjs/common'
import { DbClusterModule } from '@shared/domain/db-cluster/db-cluster.module'
import { LicenseModule } from '@shared/domain/license/license.module'
import { SpaceModule } from '@shared/domain/space/space.module'
import { SpaceMembershipModule } from '@shared/domain/space-membership/space-membership.module'
import { DbClustersListFacade } from './db-clusters-list.facade'

@Module({
  imports: [DbClusterModule, SpaceModule, SpaceMembershipModule, LicenseModule],
  providers: [DbClustersListFacade],
  exports: [DbClustersListFacade],
})
export class DbClustersListFacadeModule {}
