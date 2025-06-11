import { Injectable } from '@nestjs/common'
import { DiscussionService } from '@shared/domain/discussion/services/discussion.service'
import { AttachmentManagementFacade } from '@shared/facade/discussion/attachment-management.facade'
import { UpdateAnswerDTO } from '@shared/domain/discussion/dto/update-answer.dto'
import { SqlEntityManager } from '@mikro-orm/mysql'

@Injectable()
export class UpdateAnswerFacade {
  constructor(
    private readonly em: SqlEntityManager,
    private readonly discussionService: DiscussionService,
    private readonly attachmentFacade: AttachmentManagementFacade,
  ) {}

  async updateAnswer(answerId: number, dto: UpdateAnswerDTO): Promise<void> {
    await this.em.transactional(async () => {
      const answer = await this.discussionService.updateAnswer(answerId, dto)
      if (dto.attachments) {
        await this.attachmentFacade.updateAttachments(answer.noteId, dto.attachments)
      }
    })
  }
}
