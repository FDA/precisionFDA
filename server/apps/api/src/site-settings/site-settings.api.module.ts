import { Module } from '@nestjs/common'
import { SiteSettingsController } from './site-settings.controller'

@Module({
  controllers: [SiteSettingsController],
})
export class SiteSettingsApiModule {}
