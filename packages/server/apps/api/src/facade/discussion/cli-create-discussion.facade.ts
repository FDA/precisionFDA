import { AttachmentManagementFacade } from '@shared/facade/discussion/attachment-management.facade'
import { CreateDiscussionFacade } from './create-discussion.facade'
import { CliCreateDiscussionDTO } from '@shared/domain/cli/dto/cli-create-discussion.dto'
import { getScopeFromSpaceId } from '@shared/domain/space/space.helper'
import { DiscussionService } from '@shared/domain/discussion/services/discussion.service'
import { Injectable } from '@nestjs/common'

@Injectable()
export class CliCreateDiscussionFacade {
  constructor(
    private readonly createDiscussionFacade: CreateDiscussionFacade,
    private readonly attachmentFacade: AttachmentManagementFacade,
    private readonly discussionService: DiscussionService,
  ) {}

  async createDiscussion(spaceId: number, body: CliCreateDiscussionDTO): Promise<string> {
    const attachments = await this.attachmentFacade.transformCliAttachments(body.attachments)

    const result = await this.createDiscussionFacade.createDiscussion({
      title: body.title,
      content: body.content,
      scope: getScopeFromSpaceId(spaceId),
      notify: [],
      attachments: attachments,
    })

    return await this.discussionService.getDiscussionUiLink(result.id)
  }
}
