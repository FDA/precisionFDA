import { Module } from '@nestjs/common'
import { DbClusterModule } from '@shared/domain/db-cluster/db-cluster.module'
import { LicenseModule } from '@shared/domain/license/license.module'
import { SpaceModule } from '@shared/domain/space/space.module'
import { SpaceMembershipModule } from '@shared/domain/space-membership/space-membership.module'
import { DbClusterListFacade } from './db-cluster-list.facade'

@Module({
  imports: [DbClusterModule, SpaceModule, SpaceMembershipModule, LicenseModule],
  providers: [DbClusterListFacade],
  exports: [DbClusterListFacade],
})
export class DbClusterListFacadeModule {}
