import { Module } from '@nestjs/common'
import { PropertyModule } from '@shared/domain/property/property.module'
import { PropertyFacadeModule } from '@shared/facade/property/property-facade.module'
import { PropertiesController } from './properties.controller'

@Module({
  imports: [PropertyModule, PropertyFacadeModule],
  controllers: [PropertiesController],
})
export class PropertiesApiModule {}
