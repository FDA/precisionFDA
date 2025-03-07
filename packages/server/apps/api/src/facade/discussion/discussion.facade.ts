import { Injectable } from '@nestjs/common'
import { DiscussionService } from '@shared/domain/discussion/services/discussion.service'
import { CreateDiscussionDTO } from '@shared/domain/discussion/dto/create-discussion.dto'
import { MainQueueJobProducer } from '@shared/queue/producer/main-queue-job.producer'
import { CreateAnswerDTO } from '@shared/domain/discussion/dto/create-answer.dto'
import { CreateCommentDTO } from '@shared/domain/discussion/dto/create-comment.dto'

@Injectable()
export class DiscussionFacade {
  constructor(
    private readonly discussionService: DiscussionService,
    private readonly mainQueueJobProducer: MainQueueJobProducer,
  ) {}

  async createDiscussion(dto: CreateDiscussionDTO) {
    const newDiscussion = await this.discussionService.createDiscussion(dto)
    await this.mainQueueJobProducer.createNewDiscussionNotificationTask(
      newDiscussion.id,
      dto.notify,
    )
    return newDiscussion
  }

  async createAnswer(dto: CreateAnswerDTO) {
    const newAnswer = await this.discussionService.createAnswer(dto)
    await this.mainQueueJobProducer.createNewReplyNotificationTask(
      newAnswer.discussionId,
      dto.notify,
    )
    return newAnswer
  }

  async createComment(discussionId: number, dto: CreateCommentDTO) {
    const newComment = await this.discussionService.createComment(dto)
    await this.mainQueueJobProducer.createNewReplyNotificationTask(discussionId, dto.notify)
    return newComment
  }

  // for other methods (updates to discussion), we also need to check who follows the discussion and notify them as well.
}
