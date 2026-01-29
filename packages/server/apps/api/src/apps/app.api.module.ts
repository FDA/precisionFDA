import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppModule } from '@shared/domain/app/app.module'
import { LicenseApiFacadeModule } from '../facade/license/license-api-facade.module'

@Module({
  imports: [AppModule, LicenseApiFacadeModule],
  controllers: [AppController],
})
export class AppApiModule {}
