import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable } from '@nestjs/common'
import { UpdateDiscussionDTO } from '@shared/domain/discussion/dto/update-discussion.dto'
import { DiscussionService } from '@shared/domain/discussion/services/discussion.service'
import { AttachmentManagementFacade } from '@shared/facade/discussion/attachment-management.facade'

@Injectable()
export class UpdateDiscussionFacade {
  constructor(
    private readonly em: SqlEntityManager,
    private readonly discussionService: DiscussionService,
    private readonly attachmentFacade: AttachmentManagementFacade,
  ) {}

  async updateDiscussion(discussionId: number, dto: UpdateDiscussionDTO): Promise<void> {
    await this.em.transactional(async () => {
      const discussion = await this.discussionService.updateDiscussion(discussionId, dto)
      if (dto.attachments) {
        await this.attachmentFacade.updateAttachments(discussion.noteId, dto.attachments)
      }
    })
  }
}
