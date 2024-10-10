import { Module } from '@nestjs/common'
import { DiscussionModule } from '@shared/domain/discussion/discussion.module'
import { DiscussionQueueProcessor } from './processor/discussion.processor'

@Module({
  imports: [DiscussionModule],
  providers: [DiscussionQueueProcessor],
})
export class DiscussionWorkerModule {}
