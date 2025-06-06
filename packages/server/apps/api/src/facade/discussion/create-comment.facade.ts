import { Injectable } from '@nestjs/common'
import { DiscussionService } from '@shared/domain/discussion/services/discussion.service'
import { MainQueueJobProducer } from '@shared/queue/producer/main-queue-job.producer'
import { CreateCommentDTO } from '@shared/domain/discussion/dto/create-comment.dto'
import { CommentDTO } from '@shared/domain/discussion/dto/comment.dto'

@Injectable()
export class CreateCommentFacade {
  constructor(
    private readonly discussionService: DiscussionService,
    private readonly mainQueueJobProducer: MainQueueJobProducer,
  ) {}

  async createComment(dto: CreateCommentDTO): Promise<CommentDTO> {
    const newComment = await this.discussionService.createComment(dto)
    if (dto.discussionId) {
      await this.mainQueueJobProducer.createNewReplyNotificationTask(dto.discussionId, dto.notify)
    } else {
      const answer = await this.discussionService.getAnswer(dto.answerId)
      await this.mainQueueJobProducer.createNewReplyNotificationTask(
        answer.discussionId,
        dto.notify,
      )
    }

    return newComment
  }
}
