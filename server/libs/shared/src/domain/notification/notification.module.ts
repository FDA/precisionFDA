import { Module } from '@nestjs/common'
import { NotificationService } from '@shared/domain/notification/services/notification.service'

@Module({
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
