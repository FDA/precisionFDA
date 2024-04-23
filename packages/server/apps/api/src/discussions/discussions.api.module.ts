import { Module } from '@nestjs/common'
import { DiscussionModule } from '@shared/domain/discussion/discussion.module'
import { DiscussionsController } from './discussions.controller'

@Module({
  imports: [DiscussionModule],
  controllers: [DiscussionsController],
})
export class DiscussionsApiModule {}
