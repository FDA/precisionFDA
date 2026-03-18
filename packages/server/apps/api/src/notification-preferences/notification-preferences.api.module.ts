import { Module } from '@nestjs/common'
import { NotificationPreferenceModule } from '@shared/domain/notification-preference/notification-preference.module'
import { NotificationPreferencesController } from './notification-preferences.controller'

@Module({
  imports: [NotificationPreferenceModule],
  controllers: [NotificationPreferencesController],
})
export class NotificationPreferencesApiModule {}
