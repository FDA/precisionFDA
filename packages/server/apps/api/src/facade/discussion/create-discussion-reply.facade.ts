import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable } from '@nestjs/common'
import { DISCUSSION_REPLY_TYPE } from '@shared/domain/discussion-reply/discussion-reply.types'
import { CreateReplyDTO } from '@shared/domain/discussion/dto/create-reply.dto'
import { DiscussionReplyDTO } from '@shared/domain/discussion/dto/discussion-reply.dto'
import { DiscussionService } from '@shared/domain/discussion/services/discussion.service'
import { AttachmentManagementFacade } from '@shared/facade/discussion/attachment-management.facade'
import { MainQueueJobProducer } from '@shared/queue/producer/main-queue-job.producer'
import { EntityScopeUtils } from '@shared/utils/entity-scope.utils'

@Injectable()
export class CreateDiscussionReplyFacade {
  constructor(
    private readonly em: SqlEntityManager,
    private readonly discussionService: DiscussionService,
    private readonly attachmentFacade: AttachmentManagementFacade,
    private readonly mainQueueJobProducer: MainQueueJobProducer,
  ) {}

  async createReply(discussionId: number, dto: CreateReplyDTO): Promise<DiscussionReplyDTO> {
    const newReply = await this.em.transactional(async () => {
      const result = await this.discussionService.createReply(discussionId, dto)
      await this.attachmentFacade.createAttachments(result.noteId, dto.attachments)
      return result
    })

    await this.mainQueueJobProducer.createNewReplyNotificationTask(
      newReply.discussionId,
      dto.notify,
    )

    await this.notifySpaceMembers(newReply, dto.type)

    return newReply
  }

  private async notifySpaceMembers(
    reply: DiscussionReplyDTO,
    type: DISCUSSION_REPLY_TYPE,
  ): Promise<void> {
    const scope = reply.scope
    if (!EntityScopeUtils.isSpaceScope(scope)) {
      return
    }
    const spaceId = EntityScopeUtils.getSpaceIdFromScope(scope)
    const replyUrl =
      type === DISCUSSION_REPLY_TYPE.COMMENT
        ? await this.discussionService.getCommentUiLink(reply.id)
        : await this.discussionService.getAnswerUiLink(reply.id)

    await this.mainQueueJobProducer.createNewReplyUINotificationTask(spaceId, type, replyUrl)
  }
}
