import { Module } from '@nestjs/common'
import { SpaceModule } from '@shared/domain/space/space.module'
import { DbClusterModule } from '@shared/domain/db-cluster/db-cluster.module'
import { DbClusterListFacade } from './db-cluster-list.facade'
import { SpaceMembershipModule } from '@shared/domain/space-membership/space-membership.module'
import { LicenseModule } from '@shared/domain/license/license.module'

@Module({
  imports: [DbClusterModule, SpaceModule, SpaceMembershipModule, LicenseModule],
  providers: [DbClusterListFacade],
  exports: [DbClusterListFacade],
})
export class DbClusterListFacadeModule {}
