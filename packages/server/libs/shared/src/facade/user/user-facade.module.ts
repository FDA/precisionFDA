import { Module } from '@nestjs/common'
import { EmailModule } from '@shared/domain/email/email.module'
import { SpaceEventModule } from '@shared/domain/space-event/space-event.module'
import { SpaceMembershipModule } from '@shared/domain/space-membership/space-membership.module'
import { SpaceModule } from '@shared/domain/space/space.module'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'
import { UserSpaceInconsistencyFixService } from '@shared/facade/user/service/user-space-inconsistency-fix.service'
import { UserCheckupFacade } from '@shared/facade/user/user-checkup.facade'
import { UserDataConsistencyReportFacade } from '@shared/facade/user/user-data-consistency-report.facade'
import { PlatformClientModule } from '@shared/platform-client/platform-client.module'

@Module({
  imports: [
    PlatformClientModule,
    UserFileModule,
    SpaceModule,
    SpaceEventModule,
    SpaceMembershipModule,
    EmailModule,
  ],
  providers: [UserDataConsistencyReportFacade, UserCheckupFacade, UserSpaceInconsistencyFixService],
  exports: [UserDataConsistencyReportFacade, UserCheckupFacade],
})
export class UserFacadeModule {}
