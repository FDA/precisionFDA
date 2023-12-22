import { Module } from '@nestjs/common'
import { PropertiesController } from './properties.controller'

@Module({
  controllers: [PropertiesController],
})
export class PropertiesApiModule {}
