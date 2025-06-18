import { AttachmentManagementFacade } from '@shared/facade/discussion/attachment-management.facade'
import { DiscussionService } from '@shared/domain/discussion/services/discussion.service'
import { AttachmentsDTO } from '@shared/domain/discussion/dto/attachments.dto'
import { CliEditReplyDTO } from '@shared/domain/cli/dto/cli-edit-reply.dto'
import { InvalidStateError } from '@shared/errors'
import { UpdateAnswerFacade } from './update-answer.facade'
import { Injectable } from '@nestjs/common'

@Injectable()
export class CliUpdateDiscussionReplyFacade {
  constructor(
    private readonly updateAnswerFacade: UpdateAnswerFacade,
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

    await this.updateAnswerFacade.updateAnswer(dto.answerId, {
      content: dto.content ? `${answer.content}\n\n${dto.content}` : answer.content,
      attachments: dto.attachments ? attachments : null,
    })

    return await this.discussionService.getAnswerUiLink(dto.answerId)
  }

  private async handleCommentUpdate(dto: CliEditReplyDTO): Promise<string> {
    const comment = await this.discussionService.getComment(dto.commentId)

    await this.discussionService.updateComment(dto.commentId, {
      content: dto.content ? `${comment.body}\n\n${dto.content}` : comment.body,
    })
    return await this.discussionService.getCommentUiLink(dto.commentId)
  }
}
