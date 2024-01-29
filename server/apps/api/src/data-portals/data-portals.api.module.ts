import { Module } from '@nestjs/common'
import { DataPortalsController } from './data-portals.controller'

@Module({
  controllers: [DataPortalsController],
})
export class DataPortalsApiModule {}
