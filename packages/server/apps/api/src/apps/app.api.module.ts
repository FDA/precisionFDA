import { Module } from '@nestjs/common'
import { AppModule } from '@shared/domain/app/app.module'
import { AppFacadeModule } from '@shared/facade/app/app-facade.module'
import { LicenseApiFacadeModule } from '../facade/license/license-api-facade.module'
import { AppController } from './app.controller'

@Module({
  imports: [AppModule, LicenseApiFacadeModule, AppFacadeModule],
  controllers: [AppController],
})
export class AppApiModule {}
