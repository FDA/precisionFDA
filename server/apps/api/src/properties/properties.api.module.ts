import { Module } from '@nestjs/common'
import { PropertyModule } from '@shared/domain/property/property.module'
import { PropertiesController } from './properties.controller'

@Module({
  imports: [PropertyModule],
  controllers: [PropertiesController],
})
export class PropertiesApiModule {}
