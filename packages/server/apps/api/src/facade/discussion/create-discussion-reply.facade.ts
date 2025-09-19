import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable } from '@nestjs/common'
import { CreateReplyDTO } from '@shared/domain/discussion/dto/create-reply.dto'
import { DiscussionReplyDTO } from '@shared/domain/discussion/dto/discussion-reply.dto'
import { DiscussionService } from '@shared/domain/discussion/services/discussion.service'
import { AttachmentManagementFacade } from '@shared/facade/discussion/attachment-management.facade'
import { MainQueueJobProducer } from '@shared/queue/producer/main-queue-job.producer'

@Injectable()
export class CreateDiscussionReplyFacade {
  constructor(
    private readonly em: SqlEntityManager,
    private readonly discussionService: DiscussionService,
    private readonly attachmentFacade: AttachmentManagementFacade,
    private readonly mainQueueJobProducer: MainQueueJobProducer,
  ) {}

  async createReply(discussionId: number, dto: CreateReplyDTO): Promise<DiscussionReplyDTO> {
    const newAnswer = await this.em.transactional(async () => {
      const result = await this.discussionService.createReply(discussionId, dto)
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
