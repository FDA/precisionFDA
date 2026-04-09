import { Module } from '@nestjs/common'
import { DbClusterSynchronizeFacadeModule } from 'apps/api/src/facade/db-cluster/synchronize-facade/db-cluster-synchronize-facade.module'
import { SpaceMembershipListApiFacade } from 'apps/api/src/facade/space-membership/space-membership-list-api.facade'
import { SpaceMembershipUpdateApiFacade } from 'apps/api/src/facade/space-membership/space-membership-update-api.facade'
import { SpaceModule } from '@shared/domain/space/space.module'
import { SpaceMembershipFacadeModule } from '@shared/facade/space-membership/space-membership-facade.module'

@Module({
  imports: [SpaceMembershipFacadeModule, DbClusterSynchronizeFacadeModule, SpaceModule],
  providers: [SpaceMembershipUpdateApiFacade, SpaceMembershipListApiFacade],
  exports: [SpaceMembershipUpdateApiFacade, SpaceMembershipListApiFacade],
})
export class SpaceMembershipApiFacadeModule {}
