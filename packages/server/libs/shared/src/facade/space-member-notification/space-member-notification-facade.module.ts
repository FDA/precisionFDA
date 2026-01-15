import { Module } from '@nestjs/common'
import { NotificationModule } from '@shared/domain/notification/notification.module'
import { SpaceModule } from '@shared/domain/space/space.module'
import { SpaceMemberNotificationFacade } from './space-member-notification.facade'

@Module({
  imports: [SpaceModule, NotificationModule],
  providers: [SpaceMemberNotificationFacade],
  exports: [SpaceMemberNotificationFacade],
})
export class SpaceMemberNotificationFacadeModule {}
