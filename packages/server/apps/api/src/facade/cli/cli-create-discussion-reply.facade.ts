import { AttachmentManagementFacade } from '@shared/facade/discussion/attachment-management.facade'
import { DiscussionService } from '@shared/domain/discussion/services/discussion.service'
import { CreateAnswerFacade } from '../discussion/create-answer.facade'
import { CliCreateReplyDTO } from '@shared/domain/cli/dto/cli-create-reply.dto'
import { InvalidStateError } from '@shared/errors'
import { Injectable } from '@nestjs/common'
import { CreateCommentFacade } from '../discussion/create-comment.facade'

@Injectable()
export class CliCreateDiscussionReplyFacade {
  constructor(
    private readonly createAnswerFacade: CreateAnswerFacade,
    private readonly createCommentFacade: CreateCommentFacade,
    private readonly discussionService: DiscussionService,
    private readonly attachmentFacade: AttachmentManagementFacade,
  ) {}

  async createReply(body: CliCreateReplyDTO): Promise<string> {
    // user can not reply with answer to answer
    if (body.answerId && body.discussionId) {
      throw new InvalidStateError('Cannot reply to both answer and discussion')
    }

    if (body.replyType === 'answer' && body.answerId) {
      throw new InvalidStateError('Cannot reply with answer to answer')
    }

    if (body.replyType === 'answer') {
      const attachments = await this.attachmentFacade.transformCliAttachments(body.attachments)
      const answer = await this.createAnswerFacade.createAnswer({
        title: 'Answer',
        content: body.content,
        discussionId: body.discussionId,
        notify: [],
        attachments,
      })

      return this.discussionService.getAnswerUiLink(answer.id)
    }

    const comment = await this.createCommentFacade.createComment({
      ...body,
      notify: [],
    })
    return await this.discussionService.getCommentUiLink(comment.id)
  }
}
