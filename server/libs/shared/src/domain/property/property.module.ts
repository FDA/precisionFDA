import { Module } from '@nestjs/common'
import { PropertyService } from '@shared/domain/property/services/property.service'

@Module({
  providers: [PropertyService],
  exports: [PropertyService],
})
export class PropertyModule {}
