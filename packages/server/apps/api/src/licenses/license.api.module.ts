import { Module } from '@nestjs/common'
import { AcceptedLicenseModule } from '@shared/domain/accepted-license/accepted-license.module'
import { LicenseModule } from '@shared/domain/license/license.module'
import { LicenseApiFacadeModule } from '../facade/license/license-api-facade.module'
import { LicensesController } from './licenses.controller'

@Module({
  imports: [LicenseModule, AcceptedLicenseModule, LicenseApiFacadeModule],
  controllers: [LicensesController],
})
export class LicenseApiModule {}
