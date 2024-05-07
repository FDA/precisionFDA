import { Module } from '@nestjs/common'
import { SpacesController } from './spaces.controller'

@Module({
  controllers: [SpacesController],
})
export class SpacesApiModule {}
