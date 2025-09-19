import { Injectable } from '@nestjs/common'
import { CliCreateReplyDTO } from '@shared/domain/cli/dto/cli-create-reply.dto'
import { DISCUSSION_REPLY_TYPE } from '@shared/domain/discussion-reply/discussion-reply.types'
import { DiscussionService } from '@shared/domain/discussion/services/discussion.service'
import { InvalidStateError } from '@shared/errors'
import { AttachmentManagementFacade } from '@shared/facade/discussion/attachment-management.facade'
import { CreateDiscussionReplyFacade } from '../discussion/create-discussion-reply.facade'

@Injectable()
export class CliCreateDiscussionReplyFacade {
  constructor(
    private readonly createDiscussionReplyFacade: CreateDiscussionReplyFacade,
    private readonly discussionService: DiscussionService,
    private readonly attachmentFacade: AttachmentManagementFacade,
  ) {}

  async createReply(body: CliCreateReplyDTO): Promise<string> {
    // user can not reply with answer to answer
    if (body.answerId && body.discussionId) {
      throw new InvalidStateError('Cannot reply to both answer and discussion')
    }

    const isAnswer = body.replyType === DISCUSSION_REPLY_TYPE.ANSWER.toLowerCase()
    if (isAnswer && body.answerId) {
      throw new InvalidStateError('Cannot reply with answer to answer')
    }

    if (body.answerId) {
      const answer = await this.discussionService.getAnswer(body.answerId)
      body.discussionId = answer.discussionId
    }

    const attachments = await this.attachmentFacade.transformCliAttachments(body.attachments)
    const reply = await this.createDiscussionReplyFacade.createReply(body.discussionId, {
      title: body.replyType,
      type: isAnswer ? DISCUSSION_REPLY_TYPE.ANSWER : DISCUSSION_REPLY_TYPE.COMMENT,
      content: body.content,
      parentId: body.answerId,
      notify: [],
      attachments,
    })

    return isAnswer
      ? await this.discussionService.getAnswerUiLink(reply.id)
      : await this.discussionService.getCommentUiLink(reply.id)
  }
}
