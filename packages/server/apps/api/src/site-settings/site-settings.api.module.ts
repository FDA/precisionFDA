import { Module } from '@nestjs/common'
import { AlertModule } from '@shared/domain/alert/alert.module'
import { DataPortalModule } from '@shared/domain/data-portal/data-portal.module'
import { SiteSettingsController } from './site-settings.controller'

@Module({
  imports: [DataPortalModule, AlertModule],
  controllers: [SiteSettingsController],
})
export class SiteSettingsApiModule {}
