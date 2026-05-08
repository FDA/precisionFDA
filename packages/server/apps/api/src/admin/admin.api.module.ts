import { Module } from '@nestjs/common'
import { InvitationModule } from '@shared/domain/invitation/invitation.module'
import { SpaceModule } from '@shared/domain/space/space.module'
import { UserModule } from '@shared/domain/user/user.module'
import { AdminMembershipFacadeModule } from '@shared/facade/admin-membership/admin-membership-facade.module'
import { JobStaleCheckFacadeModule } from '@shared/facade/job/job-stale-check-facade.module'
import { StatisticsFacadeModule } from '../facade/statistics/statistics.module'
import { AdminController } from './admin.controller'
import { AdminMembershipsController } from './admin-memberships.controller'

@Module({
  imports: [
    UserModule,
    InvitationModule,
    SpaceModule,
    StatisticsFacadeModule,
    AdminMembershipFacadeModule,
    JobStaleCheckFacadeModule,
  ],
  controllers: [AdminController, AdminMembershipsController],
})
export class AdminApiModule {}
