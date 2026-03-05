import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { AcceptedLicense } from '@shared/domain/accepted-license/accepted-license.entity'
import { AcceptedLicenseService } from './accepted-license.service'

@Module({
  imports: [MikroOrmModule.forFeature([AcceptedLicense])],
  providers: [AcceptedLicenseService],
  exports: [AcceptedLicenseService],
})
export class AcceptedLicenseModule {}
