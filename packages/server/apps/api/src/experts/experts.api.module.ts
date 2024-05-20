import { Module } from '@nestjs/common'
import { ExpertsController } from './experts.controller'

@Module({
  controllers: [ExpertsController],
})
export class ExpertsApiModule {}
