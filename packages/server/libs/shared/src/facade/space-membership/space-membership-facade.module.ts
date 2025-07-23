import { Module } from '@nestjs/common'
import { SpaceMembershipCreateFacade } from '@shared/facade/space-membership/space-membership-create.facade'
import { SpaceModule } from '@shared/domain/space/space.module'
import { UserModule } from '@shared/domain/user/user.module'
import { PlatformClientModule } from '@shared/platform-client/platform-client.module'
import { EmailModule } from '@shared/domain/email/email.module'
import { SpaceEventModule } from '@shared/domain/space-event/space-event.module'

@Module({
  imports: [PlatformClientModule, SpaceModule, UserModule, EmailModule, SpaceEventModule],
  providers: [SpaceMembershipCreateFacade],
  exports: [SpaceMembershipCreateFacade],
})
export class SpaceMembershipFacadeModule {}
