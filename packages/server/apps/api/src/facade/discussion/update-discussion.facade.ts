import { Injectable } from '@nestjs/common'
import { DiscussionService } from '@shared/domain/discussion/services/discussion.service'
import { AttachmentManagementFacade } from '@shared/facade/discussion/attachment-management.facade'
import { UpdateDiscussionDTO } from '@shared/domain/discussion/dto/update-discussion.dto'
import { SqlEntityManager } from '@mikro-orm/mysql'

@Injectable()
export class UpdateDiscussionFacade {
  constructor(
    private readonly em: SqlEntityManager,
    private readonly discussionService: DiscussionService,
    private readonly attachmentFacade: AttachmentManagementFacade,
  ) {}

  async updateDiscussion(discussionId: number, dto: UpdateDiscussionDTO) {
    await this.em.transactional(async () => {
      const discussion = await this.discussionService.updateDiscussion(discussionId, dto)
      if (dto.attachments) {
        await this.attachmentFacade.updateAttachments(discussion.noteId, dto.attachments)
      }
    })
  }
}
