import { Module } from '@nestjs/common'
import { DiscussionModule } from '@shared/domain/discussion/discussion.module'
import { DiscussionApiFacadeModule } from '../facade/discussion/discussion-api-facade.module'
import { DiscussionsController } from './discussions.controller'

@Module({
  imports: [DiscussionModule, DiscussionApiFacadeModule],
  controllers: [DiscussionsController],
})
export class DiscussionsApiModule {}
