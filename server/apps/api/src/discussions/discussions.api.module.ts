import { Module } from '@nestjs/common'
import { DiscussionsController } from './discussions.controller'

@Module({
  controllers: [DiscussionsController],
})
export class DiscussionsApiModule {}
