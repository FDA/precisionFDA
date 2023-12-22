import { Module } from '@nestjs/common'
import { LicenseController } from './license.controller'

@Module({
  controllers: [LicenseController],
})
export class LicenseApiModule {}
