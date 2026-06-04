import { Module } from '@nestjs/common'
import { AppModule } from '@shared/domain/app/app.module'
import { AppFacadeModule } from '@shared/facade/app/app-facade.module'
import { LicenseApiFacadeModule } from '../facade/license/license-api-facade.module'
import { AppsController } from './apps.controller'

@Module({
  imports: [AppModule, LicenseApiFacadeModule, AppFacadeModule],
  controllers: [AppsController],
})
export class AppApiModule {}
