import { Injectable } from '@nestjs/common'
import { CliEditReplyDTO } from '@shared/domain/cli/dto/cli-edit-reply.dto'
import { AttachmentsDTO } from '@shared/domain/discussion/dto/attachments.dto'
import { DiscussionService } from '@shared/domain/discussion/services/discussion.service'
import { DISCUSSION_REPLY_TYPE } from '@shared/domain/discussion-reply/discussion-reply.types'
import { AttachmentManagementFacade } from '@shared/facade/discussion/attachment-management.facade'
import { AttachmentRetrieveFacade } from '@shared/facade/discussion/attachment-retrieve.facade'
import { UpdateDiscussionReplyFacade } from '../discussion/update-reply.facade'

@Injectable()
export class CliUpdateDiscussionReplyFacade {
  constructor(
    private readonly updateDiscussionReplyFacade: UpdateDiscussionReplyFacade,
    private readonly discussionService: DiscussionService,
    private readonly attachmentFacade: AttachmentManagementFacade,
    private readonly attachmentRetrieveFacade: AttachmentRetrieveFacade,
  ) {}

  async updateReply(replyId: number, dto: CliEditReplyDTO): Promise<string> {
    const reply = await this.discussionService.getDiscussionReply(replyId)

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
      const existingAttachments = await this.attachmentRetrieveFacade.getAttachments(reply.noteId)
      attachments = {
        files: existingAttachments.filter(a => a.type === 'UserFile').map(a => a.id),
        folders: existingAttachments.filter(a => a.type === 'Folder').map(a => a.id),
        assets: existingAttachments.filter(a => a.type === 'Asset').map(a => a.id),
        apps: existingAttachments.filter(a => a.type === 'App').map(a => a.id),
        jobs: existingAttachments.filter(a => a.type === 'Job').map(a => a.id),
        comparisons: existingAttachments.filter(a => a.type === 'Comparison').map(a => a.id),
      }

      attachments.files.push(...newAttachments.files)
      attachments.folders.push(...newAttachments.folders)
      attachments.assets.push(...newAttachments.assets)
      attachments.apps.push(...newAttachments.apps)
      attachments.jobs.push(...newAttachments.jobs)
      attachments.comparisons.push(...newAttachments.comparisons)
    }

    const content = dto.content ? `${reply.content}\n\n${dto.content}` : reply.content
    const updatedAttachments = dto.attachments ? attachments : null

    await this.updateDiscussionReplyFacade.updateReply(replyId, {
      content,
      attachments: updatedAttachments,
      type: reply.replyType,
    })

    return reply.replyType === DISCUSSION_REPLY_TYPE.ANSWER
      ? await this.discussionService.getAnswerUiLink(replyId)
      : await this.discussionService.getCommentUiLink(replyId)
  }
}
