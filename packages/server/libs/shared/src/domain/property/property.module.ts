import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { PropertyService } from '@shared/domain/property/services/property.service'
import { GeneralProperty } from './property.entity'

@Module({
  imports: [MikroOrmModule.forFeature([GeneralProperty])],
  providers: [PropertyService],
  exports: [PropertyService],
})
export class PropertyModule {}
