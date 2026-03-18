import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { NotificationPreference } from './notification-preference.entity'
import { NotificationPreferenceService } from './notification-preference.service'

@Module({
  imports: [MikroOrmModule.forFeature([NotificationPreference])],
  providers: [NotificationPreferenceService],
  exports: [NotificationPreferenceService],
})
export class NotificationPreferenceModule {}
