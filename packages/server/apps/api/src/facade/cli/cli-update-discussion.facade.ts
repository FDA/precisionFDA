import { Injectable } from '@nestjs/common'
import { CliEditDiscussionDTO } from '@shared/domain/cli/dto/cli-edit-discussion.dto'
import { AttachmentsDTO } from '@shared/domain/discussion/dto/attachments.dto'
import { DiscussionService } from '@shared/domain/discussion/services/discussion.service'
import { AttachmentManagementFacade } from '@shared/facade/discussion/attachment-management.facade'
import { AttachmentRetrieveFacade } from '@shared/facade/discussion/attachment-retrieve.facade'
import { UpdateDiscussionFacade } from '../discussion/update-discussion.facade'

@Injectable()
export class CliUpdateDiscussionFacade {
  constructor(
    private readonly updateDiscussionFacade: UpdateDiscussionFacade,
    private readonly discussionService: DiscussionService,
    private readonly attachmentFacade: AttachmentManagementFacade,
    private readonly attachmentRetrieveFacade: AttachmentRetrieveFacade,
  ) {}

  async updateDiscussion(discussionId: number, dto: CliEditDiscussionDTO): Promise<string> {
    const discussion = await this.discussionService.getDiscussion(discussionId)

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
      const existingAttachments = await this.attachmentRetrieveFacade.getAttachments(discussion.noteId)
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

    await this.updateDiscussionFacade.updateDiscussion(discussionId, {
      title: null,
      content: dto.content ? `${discussion.content}\n\n${dto.content}` : discussion.content,
      attachments: dto.attachments ? attachments : null,
    })

    return await this.discussionService.getDiscussionUiLink(discussionId)
  }
}
