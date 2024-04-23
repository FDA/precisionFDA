import { Module } from '@nestjs/common'
import { LicenseController } from './license.controller'
import { LicenseModule } from '@shared/domain/license/license.module'

@Module({
  imports: [LicenseModule],
  controllers: [LicenseController],
})
export class LicenseApiModule {}
