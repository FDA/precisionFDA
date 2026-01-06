import { Module } from '@nestjs/common'
import { InvitationModule } from '@shared/domain/invitation/invitation.module'
import { UserModule } from '@shared/domain/user/user.module'
import { AdminController } from './admin.controller'
import { SpaceModule } from '@shared/domain/space/space.module'
import { StatisticsFacadeModule } from '../facade/statistics/statistics.module'

@Module({
  imports: [UserModule, InvitationModule, SpaceModule, StatisticsFacadeModule],
  controllers: [AdminController],
})
export class AdminApiModule {}
