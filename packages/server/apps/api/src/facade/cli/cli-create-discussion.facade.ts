import { Injectable } from '@nestjs/common'
import { CliCreateDiscussionDTO } from '@shared/domain/cli/dto/cli-create-discussion.dto'
import { DiscussionService } from '@shared/domain/discussion/services/discussion.service'
import { AttachmentManagementFacade } from '@shared/facade/discussion/attachment-management.facade'
import { EntityScopeUtils } from '@shared/utils/entity-scope.utils'
import { CreateDiscussionFacade } from '../discussion/create-discussion.facade'

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
      scope: EntityScopeUtils.getScopeFromSpaceId(spaceId),
      notify: [],
      attachments: attachments,
    })

    return await this.discussionService.getDiscussionUiLink(result.id)
  }
}
