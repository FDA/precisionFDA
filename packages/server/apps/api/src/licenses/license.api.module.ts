import { Module } from '@nestjs/common'
import { AcceptedLicenseModule } from '@shared/domain/accepted-license/accepted-license.module'
import { LicenseModule } from '@shared/domain/license/license.module'
import { LicenseController } from './license.controller'

@Module({
  imports: [LicenseModule, AcceptedLicenseModule],
  controllers: [LicenseController],
})
export class LicenseApiModule {}
