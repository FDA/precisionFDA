import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { EmailModule } from '@shared/domain/email/email.module'
import { Invitation } from '@shared/domain/invitation/invitation.entity'
import { NotificationModule } from '@shared/domain/notification/notification.module'
import { Organization } from '@shared/domain/org/organization.entity'
import { SpaceModule } from '@shared/domain/space/space.module'
import { SpaceEventModule } from '@shared/domain/space-event/space-event.module'
import { SpaceMembershipModule } from '@shared/domain/space-membership/space-membership.module'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'
import { SpaceMembershipFacadeModule } from '@shared/facade/space-membership/space-membership-facade.module'
import { UserSpaceInconsistencyFixService } from '@shared/facade/user/service/user-space-inconsistency-fix.service'
import { UserCheckupFacade } from '@shared/facade/user/user-checkup.facade'
import { UserDataConsistencyReportFacade } from '@shared/facade/user/user-data-consistency-report.facade'
import { PlatformClientModule } from '@shared/platform-client/platform-client.module'
import { UserProvisionFacade } from './user-provision.facade'

@Module({
  imports: [
    PlatformClientModule,
    UserFileModule,
    SpaceModule,
    SpaceEventModule,
    SpaceMembershipModule,
    EmailModule,
    MikroOrmModule.forFeature([Organization, Invitation]),
    NotificationModule,
    SpaceMembershipFacadeModule,
  ],
  providers: [
    UserDataConsistencyReportFacade,
    UserCheckupFacade,
    UserSpaceInconsistencyFixService,
    UserProvisionFacade,
  ],
  exports: [UserDataConsistencyReportFacade, UserCheckupFacade, UserProvisionFacade],
})
export class UserFacadeModule {}
