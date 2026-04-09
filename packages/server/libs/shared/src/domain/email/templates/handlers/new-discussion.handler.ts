import { Injectable } from '@nestjs/common'
import DiscussionRepository from '@shared/domain/discussion/discussion.repository'
import { DiscussionNotificationDTO } from '@shared/domain/email/dto/discussion-notification.dto'
import { DiscussionContext, EmailTypeToContextMap } from '@shared/domain/email/dto/email-type-to-context.map'
import { EmailTypeToTemplateInputMap } from '@shared/domain/email/dto/email-type-to-template-input.map'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { EmailHandler } from '@shared/domain/email/templates/handlers/email.handler'
import { newDiscussionTemplate } from '@shared/domain/email/templates/mjml/new-discussion.template'
import { EntityService } from '@shared/domain/entity/entity.service'
import { SpaceRepository } from '@shared/domain/space/space.repository'
import { SpaceMembershipRepository } from '@shared/domain/space-membership/space-membership.repository'
import { User } from '@shared/domain/user/user.entity'
import { UserRepository } from '@shared/domain/user/user.repository'
import { EmailClient } from '@shared/services/email-client'
import { EntityScopeUtils } from '@shared/utils/entity-scope.utils'

@Injectable()
export class NewDiscussionHandler extends EmailHandler<EMAIL_TYPES.newDiscussion> {
  protected emailType = EMAIL_TYPES.newDiscussion as const
  protected inputDto = DiscussionNotificationDTO
  protected getBody = newDiscussionTemplate

  constructor(
    protected readonly discussionRepo: DiscussionRepository,
    protected readonly spaceRepo: SpaceRepository,
    protected readonly userRepo: UserRepository,
    protected readonly spaceMembershipRepo: SpaceMembershipRepository,
    protected readonly entityService: EntityService,
    protected readonly emailClient: EmailClient,
  ) {
    super(emailClient)
  }

  protected async getContextualData(
    input: DiscussionNotificationDTO,
  ): Promise<EmailTypeToContextMap[EMAIL_TYPES.newDiscussion]> {
    const discussion = await this.discussionRepo.findOne(input.discussionId, {
      populate: ['note', 'user'],
    })
    if (!discussion) {
      this.logger.log(`Discussion with id ${input.discussionId} not found, skipping notification`)
      return
    }

    const discussionLink = await this.entityService.getEntityUiLink(discussion)
    const note = discussion.note.getEntity()
    const scope = note.scope

    if (!EntityScopeUtils.isSpaceScope(scope)) {
      this.logger.log('New discussion is public, not in a space, skipping notification')
      return
    }

    const spaceId = EntityScopeUtils.getSpaceIdFromScope(scope)
    const space = await this.spaceRepo.findOne(spaceId)

    return { discussionLink, input, discussion, space }
  }

  protected getSubject(context: DiscussionContext): string {
    return `[precisionFDA] New Discussion notification: ${context.space.name}`
  }

  protected getTemplateInput(
    contextObject: EmailTypeToContextMap[EMAIL_TYPES.newDiscussion],
  ): EmailTypeToTemplateInputMap[EMAIL_TYPES.newDiscussion] {
    return {
      url: contextObject.discussionLink,
      spaceName: contextObject.space.name,
    }
  }

  protected async determineReceivers(context: EmailTypeToContextMap[EMAIL_TYPES.newDiscussion]): Promise<User[]> {
    if (context.input.notify === 'all') {
      const spaceMemberships = await this.spaceMembershipRepo.find(
        { spaces: context.space.id, active: true },
        { populate: ['user'] },
      )
      return spaceMemberships.map(spaceMembership => spaceMembership.user.getEntity())
    }

    if (context.input.notify === 'author') {
      return [context.discussion.user.getEntity()]
    }

    return await this.userRepo.find({
      dxuser: { $in: context.input.notify },
      spaceMemberships: { spaces: context.space.id, active: true },
    })
  }
}
