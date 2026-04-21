import { Module } from '@nestjs/common'
import { InvitationModule } from '@shared/domain/invitation/invitation.module'
import { SpaceModule } from '@shared/domain/space/space.module'
import { UserModule } from '@shared/domain/user/user.module'
import { JobStaleCheckFacadeModule } from '@shared/facade/job/job-stale-check-facade.module'
import { StatisticsFacadeModule } from '../facade/statistics/statistics.module'
import { AdminController } from './admin.controller'

@Module({
  imports: [UserModule, InvitationModule, SpaceModule, StatisticsFacadeModule, JobStaleCheckFacadeModule],
  controllers: [AdminController],
})
export class AdminApiModule {}
