import { Module } from '@nestjs/common'
import { NotificationModule } from '@shared/domain/notification/notification.module'
import { NotificationsController } from './notifications.controller'

@Module({
  imports: [NotificationModule],
  controllers: [NotificationsController],
})
export class NotificationsApiModule {}
