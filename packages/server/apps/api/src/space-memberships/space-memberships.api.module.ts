import { Module } from '@nestjs/common'
import { SpaceMembershipApiFacadeModule } from '../facade/space-membership/space-membership-api-facade.module'
import { SpaceMembershipsController } from './space-memberships.controller'

@Module({
  imports: [SpaceMembershipApiFacadeModule],
  controllers: [SpaceMembershipsController],
})
export class SpaceMembershipsApiModule {}
