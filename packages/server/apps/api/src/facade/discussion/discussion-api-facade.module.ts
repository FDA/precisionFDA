import { Module } from '@nestjs/common'
import { DiscussionModule } from '@shared/domain/discussion/discussion.module'
import { EmailModule } from '@shared/domain/email/email.module'
import { SpaceModule } from '@shared/domain/space/space.module'
import { AttachmentsFacadeModule } from '@shared/facade/discussion/attachments-facade.module'
import { CliCreateDiscussionReplyFacade } from '../cli/cli-create-discussion-reply.facade'
import { CliCreateDiscussionFacade } from '../cli/cli-create-discussion.facade'
import { CliUpdateDiscussionReplyFacade } from '../cli/cli-update-discussion-reply.facade'
import { CliUpdateDiscussionFacade } from '../cli/cli-update-discussion.facade'
import { CreateDiscussionReplyFacade } from './create-discussion-reply.facade'
import { CreateDiscussionFacade } from './create-discussion.facade'
import { UpdateDiscussionFacade } from './update-discussion.facade'
import { UpdateDiscussionReplyFacade } from './update-reply.facade'

@Module({
  imports: [DiscussionModule, EmailModule, SpaceModule, AttachmentsFacadeModule],
  providers: [
    CreateDiscussionFacade,
    UpdateDiscussionFacade,
    CreateDiscussionReplyFacade,
    UpdateDiscussionReplyFacade,
    CliCreateDiscussionFacade,
    CliCreateDiscussionReplyFacade,
    CliUpdateDiscussionFacade,
    CliUpdateDiscussionReplyFacade,
  ],
  exports: [
    CreateDiscussionFacade,
    UpdateDiscussionFacade,
    UpdateDiscussionReplyFacade,
    CreateDiscussionReplyFacade,
    CliCreateDiscussionFacade,
    CliCreateDiscussionReplyFacade,
    CliUpdateDiscussionFacade,
    CliUpdateDiscussionReplyFacade,
  ],
})
export class DiscussionApiFacadeModule {}
