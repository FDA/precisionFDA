import { Module } from '@nestjs/common'
import { DiscussionModule } from '@shared/domain/discussion/discussion.module'
import { DiscussionsController } from './discussions.controller'
import { DiscussionApiFacadeModule } from '../facade/discussion/discussion-api-facade.module'
import { AttachmentsFacadeModule } from '@shared/facade/discussion/attachments-facade.module'

@Module({
  imports: [DiscussionModule, DiscussionApiFacadeModule, AttachmentsFacadeModule],
  controllers: [DiscussionsController],
})
export class DiscussionsApiModule {}
