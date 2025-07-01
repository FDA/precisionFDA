import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { AcceptedLicense } from '@shared/domain/accepted-license/accepted-license.entity'

@Module({
  imports: [MikroOrmModule.forFeature([AcceptedLicense])],
  providers: [],
  exports: [],
})
export class AcceptedLicenseModule {}
