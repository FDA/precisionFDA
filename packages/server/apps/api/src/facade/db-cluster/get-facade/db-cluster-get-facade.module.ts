import { Module } from '@nestjs/common'
import { DbClusterModule } from '@shared/domain/db-cluster/db-cluster.module'
import { LicenseModule } from '@shared/domain/license/license.module'
import { SpaceModule } from '@shared/domain/space/space.module'
import { SpaceMembershipModule } from '@shared/domain/space-membership/space-membership.module'
import { DbClusterGetFacade } from './db-cluster-get.facade'

@Module({
  imports: [DbClusterModule, SpaceModule, SpaceMembershipModule, LicenseModule],
  providers: [DbClusterGetFacade],
  exports: [DbClusterGetFacade],
})
export class DbClusterGetFacadeModule {}
