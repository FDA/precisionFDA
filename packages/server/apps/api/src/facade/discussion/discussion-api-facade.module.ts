import { Module } from '@nestjs/common'
import { EmailModule } from '@shared/domain/email/email.module'
import { DiscussionModule } from '@shared/domain/discussion/discussion.module'
import { CreateDiscussionFacade } from './create-discussion.facade'
import { AttachmentsFacadeModule } from '@shared/facade/discussion/attachments-facade.module'
import { SpaceModule } from '@shared/domain/space/space.module'
import { UpdateDiscussionFacade } from './update-discussion.facade'
import { CreateAnswerFacade } from './create-answer.facade'
import { UpdateAnswerFacade } from './update-answer.facade'
import { CliCreateDiscussionFacade } from '../cli/cli-create-discussion.facade'
import { CliCreateDiscussionReplyFacade } from '../cli/cli-create-discussion-reply.facade'
import { CliUpdateDiscussionFacade } from '../cli/cli-update-discussion.facade'
import { CliUpdateDiscussionReplyFacade } from '../cli/cli-update-discussion-reply.facade'
import { CreateCommentFacade } from './create-comment.facade'

@Module({
  imports: [DiscussionModule, EmailModule, SpaceModule, AttachmentsFacadeModule],
  providers: [
    CreateDiscussionFacade,
    UpdateDiscussionFacade,
    CreateAnswerFacade,
    UpdateAnswerFacade,
    CliCreateDiscussionFacade,
    CliCreateDiscussionReplyFacade,
    CliUpdateDiscussionFacade,
    CliUpdateDiscussionReplyFacade,
    CreateCommentFacade,
  ],
  exports: [
    CreateDiscussionFacade,
    UpdateDiscussionFacade,
    CreateAnswerFacade,
    UpdateAnswerFacade,
    CliCreateDiscussionFacade,
    CliCreateDiscussionReplyFacade,
    CliUpdateDiscussionFacade,
    CliUpdateDiscussionReplyFacade,
    CreateCommentFacade,
  ],
})
export class DiscussionApiFacadeModule {}
