import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable } from '@nestjs/common'
import { CreateDiscussionDTO } from '@shared/domain/discussion/dto/create-discussion.dto'
import { DiscussionDTO } from '@shared/domain/discussion/dto/discussion.dto'
import { DiscussionService } from '@shared/domain/discussion/services/discussion.service'
import { SpaceService } from '@shared/domain/space/service/space.service'
import { SPACE_TYPE } from '@shared/domain/space/space.enum'
import * as errors from '@shared/errors'
import { AttachmentManagementFacade } from '@shared/facade/discussion/attachment-management.facade'
import { MainQueueJobProducer } from '@shared/queue/producer/main-queue-job.producer'
import { EntityScopeUtils } from '@shared/utils/entity-scope.utils'

@Injectable()
export class CreateDiscussionFacade {
  constructor(
    private readonly em: SqlEntityManager,
    private readonly discussionService: DiscussionService,
    private readonly attachmentFacade: AttachmentManagementFacade,
    private readonly spaceService: SpaceService,
    private readonly mainQueueJobProducer: MainQueueJobProducer,
  ) {}

  async createDiscussion(dto: CreateDiscussionDTO): Promise<DiscussionDTO> {
    if (EntityScopeUtils.isSpaceScope(dto.scope)) {
      const spaceID = EntityScopeUtils.getSpaceIdFromScope(dto.scope)
      const space = await this.spaceService.getAccessibleById(spaceID)
      if (!space) {
        throw new errors.PermissionError('Unable to create discussion: insufficient permissions to access the space.')
      }
      if (
        space.type === SPACE_TYPE.PRIVATE_TYPE ||
        (space.type === SPACE_TYPE.REVIEW && space.meta?.restricted_discussions)
      ) {
        throw new errors.InvalidStateError('Unable to create discussion: the space has restricted discussions.')
      }
    }

    const newDiscussion = await this.em.transactional(async () => {
      const result = await this.discussionService.createDiscussion(dto)
      await this.attachmentFacade.createAttachments(result.noteId, dto.attachments)
      return result
    })
    await this.mainQueueJobProducer.createNewDiscussionNotificationTask(newDiscussion.id, dto.notify)
    return newDiscussion
  }
}
