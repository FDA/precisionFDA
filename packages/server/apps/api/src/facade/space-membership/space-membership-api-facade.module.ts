import { Module } from '@nestjs/common'
import { SpaceMembershipFacadeModule } from '@shared/facade/space-membership/space-membership-facade.module'
import { DbClusterSynchronizeFacadeModule } from '../db-cluster/synchronize-facade/db-cluster-synchronize-facade.module'
import { SpaceMembershipUpdateApiFacade } from './space-membership-update-api.facade'

@Module({
  imports: [SpaceMembershipFacadeModule, DbClusterSynchronizeFacadeModule],
  providers: [SpaceMembershipUpdateApiFacade],
  exports: [SpaceMembershipUpdateApiFacade],
})
export class SpaceMembershipApiFacadeModule {}
