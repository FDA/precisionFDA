import { Module } from '@nestjs/common'
import { LicenseService } from '@shared/domain/license/license.service'

@Module({
  providers: [LicenseService],
  exports: [LicenseService],
})
export class LicenseModule {}
