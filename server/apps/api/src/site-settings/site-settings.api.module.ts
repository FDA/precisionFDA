import { Module } from '@nestjs/common'
import { AlertModule } from '@shared/domain/alert/alert.module'
import { SiteSettingsController } from './site-settings.controller'

@Module({
  controllers: [SiteSettingsController],
  imports: [AlertModule]
})
export class SiteSettingsApiModule {}
