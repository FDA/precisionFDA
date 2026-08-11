import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { Notification } from './notification.entity'

@Module({
  imports: [MikroOrmModule.forFeature([Notification])],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
