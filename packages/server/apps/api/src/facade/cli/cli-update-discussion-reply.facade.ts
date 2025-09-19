import { Injectable } from '@nestjs/common'
import { CliEditReplyDTO } from '@shared/domain/cli/dto/cli-edit-reply.dto'
import { DISCUSSION_REPLY_TYPE } from '@shared/domain/discussion-reply/discussion-reply.types'
import { AttachmentsDTO } from '@shared/domain/discussion/dto/attachments.dto'
import { DiscussionService } from '@shared/domain/discussion/services/discussion.service'
import { InvalidStateError } from '@shared/errors'
import { AttachmentManagementFacade } from '@shared/facade/discussion/attachment-management.facade'
import { UpdateDiscussionReplyFacade } from '../discussion/update-reply.facade'

@Injectable()
export class CliUpdateDiscussionReplyFacade {
  constructor(
    private readonly updateDiscussionReplyFacade: UpdateDiscussionReplyFacade,
    private readonly discussionService: DiscussionService,
    private readonly attachmentFacade: AttachmentManagementFacade,
  ) {}

  async updateReply(dto: CliEditReplyDTO): Promise<string> {
    if (dto.answerId && dto.commentId) {
      throw new InvalidStateError('Cannot edit both answer and comment')
    }

    if (dto.answerId) {
      return await this.handleAnswerUpdate(dto)
    }
    return await this.handleCommentUpdate(dto)
  }

  private async handleAnswerUpdate(dto: CliEditReplyDTO): Promise<string> {
    const answer = await this.discussionService.getAnswer(dto.answerId)

    let attachments: AttachmentsDTO = {
      files: [],
      folders: [],
      assets: [],
      apps: [],
      jobs: [],
      comparisons: [],
    }
    if (dto.attachments) {
      const newAttachments = await this.attachmentFacade.transformCliAttachments(dto.attachments)
      const existingAttachments = await this.attachmentFacade.getAttachments(answer.noteId)
      attachments = {
        files: existingAttachments.filter((a) => a.type === 'UserFile').map((a) => a.id),
        folders: existingAttachments.filter((a) => a.type === 'Folder').map((a) => a.id),
        assets: existingAttachments.filter((a) => a.type === 'Asset').map((a) => a.id),
        apps: existingAttachments.filter((a) => a.type === 'App').map((a) => a.id),
        jobs: existingAttachments.filter((a) => a.type === 'Job').map((a) => a.id),
        comparisons: existingAttachments.filter((a) => a.type === 'Comparison').map((a) => a.id),
      }

      attachments.files.push(...newAttachments.files)
      attachments.folders.push(...newAttachments.folders)
      attachments.assets.push(...newAttachments.assets)
      attachments.apps.push(...newAttachments.apps)
      attachments.jobs.push(...newAttachments.jobs)
      attachments.comparisons.push(...newAttachments.comparisons)
    }

    const content = dto.content ? `${answer.content}\n\n${dto.content}` : answer.content
    const updatedAttachments = dto.attachments ? attachments : null

    await this.updateDiscussionReplyFacade.updateReply(dto.answerId, {
      content,
      attachments: updatedAttachments,
      type: DISCUSSION_REPLY_TYPE.ANSWER,
    })

    return await this.discussionService.getAnswerUiLink(dto.answerId)
  }

  private async handleCommentUpdate(dto: CliEditReplyDTO): Promise<string> {
    const comment = await this.discussionService.getComment(dto.commentId)
    const content = dto.content ? `${comment.body}\n\n${dto.content}` : comment.body

    await this.updateDiscussionReplyFacade.updateReply(dto.commentId, {
      content,
      attachments: null,
      type: DISCUSSION_REPLY_TYPE.COMMENT,
    })

    return await this.discussionService.getCommentUiLink(dto.commentId)
  }
}
