import { Module } from '@nestjs/common'
import { InvitationModule } from '@shared/domain/invitation/invitation.module'
import { UserModule } from '@shared/domain/user/user.module'
import { PlatformClientModule } from '@shared/platform-client/platform-client.module'
import { AdminController } from './admin.controller'
import { SpaceModule } from '@shared/domain/space/space.module'

@Module({
  imports: [PlatformClientModule, UserModule, InvitationModule, SpaceModule],
  controllers: [AdminController],
})
export class AdminApiModule {}
