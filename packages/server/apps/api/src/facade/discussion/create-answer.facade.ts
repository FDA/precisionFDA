import { Injectable } from '@nestjs/common'
import { DiscussionService } from '@shared/domain/discussion/services/discussion.service'
import { MainQueueJobProducer } from '@shared/queue/producer/main-queue-job.producer'
import { AttachmentManagementFacade } from '@shared/facade/discussion/attachment-management.facade'
import { CreateAnswerDTO } from '@shared/domain/discussion/dto/create-answer.dto'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { AnswerDTO } from '@shared/domain/discussion/dto/answer.dto'

@Injectable()
export class CreateAnswerFacade {
  constructor(
    private readonly em: SqlEntityManager,
    private readonly discussionService: DiscussionService,
    private readonly attachmentFacade: AttachmentManagementFacade,
    private readonly mainQueueJobProducer: MainQueueJobProducer,
  ) {}

  async createAnswer(dto: CreateAnswerDTO): Promise<AnswerDTO> {
    const newAnswer = await this.em.transactional(async () => {
      const result = await this.discussionService.createAnswer(dto)
      await this.attachmentFacade.createAttachments(result.noteId, dto.attachments)
      return result
    })

    await this.mainQueueJobProducer.createNewReplyNotificationTask(
      newAnswer.discussionId,
      dto.notify,
    )

    return newAnswer
  }
}
