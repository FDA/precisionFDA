import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable } from '@nestjs/common'
import { UpdateReplyDTO } from '@shared/domain/discussion/dto/update-reply.dto'
import { DiscussionService } from '@shared/domain/discussion/services/discussion.service'
import { AttachmentManagementFacade } from '@shared/facade/discussion/attachment-management.facade'

@Injectable()
export class UpdateDiscussionReplyFacade {
  constructor(
    private readonly em: SqlEntityManager,
    private readonly discussionService: DiscussionService,
    private readonly attachmentFacade: AttachmentManagementFacade,
  ) {}

  async updateReply(replyId: number, dto: UpdateReplyDTO): Promise<void> {
    await this.em.transactional(async () => {
      const reply = await this.discussionService.updateReply(replyId, dto)
      if (dto.attachments) {
        await this.attachmentFacade.updateAttachments(reply.noteId, dto.attachments)
      }
    })
  }
}
