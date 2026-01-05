import { Module } from '@nestjs/common'
import { EmailModule } from '@shared/domain/email/email.module'
import { SpaceEventModule } from '@shared/domain/space-event/space-event.module'
import { SpaceMembershipModule } from '@shared/domain/space-membership/space-membership.module'
import { SpaceModule } from '@shared/domain/space/space.module'
import { UserModule } from '@shared/domain/user/user.module'
import { SpaceMembershipCreateFacade } from '@shared/facade/space-membership/space-membership-create.facade'
import { PlatformClientModule } from '@shared/platform-client/platform-client.module'
import { SpaceMembershipUpdateFacade } from './space-membership-update.facade'

@Module({
  imports: [
    PlatformClientModule,
    SpaceModule,
    UserModule,
    EmailModule,
    SpaceEventModule,
    SpaceMembershipModule,
  ],
  providers: [SpaceMembershipCreateFacade, SpaceMembershipUpdateFacade],
  exports: [SpaceMembershipCreateFacade, SpaceMembershipUpdateFacade],
})
export class SpaceMembershipFacadeModule {}
