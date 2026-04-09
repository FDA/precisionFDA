import { Injectable } from '@nestjs/common'
import { Discussion } from '@shared/domain/discussion/discussion.entity'
import DiscussionRepository from '@shared/domain/discussion/discussion.repository'
import { DiscussionNotificationDTO } from '@shared/domain/email/dto/discussion-notification.dto'
import { DiscussionContext, EmailTypeToContextMap } from '@shared/domain/email/dto/email-type-to-context.map'
import { EmailTypeToTemplateInputMap } from '@shared/domain/email/dto/email-type-to-template-input.map'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { EmailHandler } from '@shared/domain/email/templates/handlers/email.handler'
import { newDiscussionReplyTemplate } from '@shared/domain/email/templates/mjml/new-discussion-reply.template'
import { EntityService } from '@shared/domain/entity/entity.service'
import { Space } from '@shared/domain/space/space.entity'
import { SpaceRepository } from '@shared/domain/space/space.repository'
import { SpaceMembershipRepository } from '@shared/domain/space-membership/space-membership.repository'
import { USER_STATE, User } from '@shared/domain/user/user.entity'
import { UserRepository } from '@shared/domain/user/user.repository'
import { EmailClient } from '@shared/services/email-client'
import { EntityScopeUtils } from '@shared/utils/entity-scope.utils'

@Injectable()
export class NewDiscussionReplyHandler extends EmailHandler<EMAIL_TYPES.newDiscussionReply> {
  protected emailType = EMAIL_TYPES.newDiscussionReply as const
  protected inputDto = DiscussionNotificationDTO
  protected getBody = newDiscussionReplyTemplate

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
  ): Promise<EmailTypeToContextMap[EMAIL_TYPES.newDiscussionReply]> {
    const discussion = await this.discussionRepo.findOne(input.discussionId, {
      populate: ['note', 'user', 'follows'],
    })

    if (!discussion) {
      this.logger.log(`Discussion (id: ${input.discussionId}) not found, skipping notification`)
      return
    }

    const note = discussion.note.getEntity()
    const discussionLink = await this.entityService.getEntityUiLink(discussion)
    let space: Space

    if (EntityScopeUtils.isSpaceScope(note.scope)) {
      const spaceId = EntityScopeUtils.getSpaceIdFromScope(note.scope)
      space = await this.spaceRepo.findOne(spaceId)
    }

    return { discussionLink, discussion, space, input }
  }

  /**
   * Get all users following the discussion, including the discussion owner.
   * Only currently active users are returned.
   * @param discussion
   */
  private async getFollowers(discussion: Discussion): Promise<User[]> {
    const userIDs = discussion.follows
      .getItems()
      .filter(follow => follow.followerType === 'User')
      .map(follow => follow.followerId)

    if (userIDs.length > 0) {
      return await this.userRepo.find({ id: { $in: userIDs }, userState: USER_STATE.ENABLED })
    }
    return []
  }

  protected async determineReceivers(context: EmailTypeToContextMap[EMAIL_TYPES.newDiscussionReply]): Promise<User[]> {
    const users: User[] = await this.getFollowers(context.discussion)

    if (EntityScopeUtils.isSpaceScope(context.discussion.note.getEntity().scope)) {
      this.logger.log('Discussion is in space....')

      if (context.input.notify === 'all') {
        const spaceMemberships = await this.spaceMembershipRepo.find(
          { spaces: context.space.id, active: true },
          { populate: ['user'] },
        )
        return spaceMemberships.map(spaceMembership => spaceMembership.user.getEntity())
      }

      if (context.input.notify === 'author') {
        users.push(context.discussion.user.getEntity())
      }

      if (Array.isArray(context.input.notify) && context.input.notify.length) {
        const specificUsers = await this.userRepo.find({
          dxuser: { $in: context.input.notify },
          spaceMemberships: { spaces: context.space.id, active: true },
        })
        users.push(...specificUsers)
      }
    }

    return Array.from(new Set(users.map(user => user.id))).map(id => users.find(user => user.id === id))
  }

  protected getTemplateInput(
    contextObject: EmailTypeToContextMap[EMAIL_TYPES.newDiscussionReply],
  ): EmailTypeToTemplateInputMap[EMAIL_TYPES.newDiscussionReply] {
    return {
      url: contextObject.discussionLink,
      spaceName: EntityScopeUtils.isSpaceScope(contextObject.discussion.note.getEntity().scope)
        ? contextObject.space.name
        : null,
    }
  }

  protected getSubject(context: DiscussionContext): string {
    if (EntityScopeUtils.isSpaceScope(context.discussion.note.getEntity().scope)) {
      return `[precisionFDA] New Discussion reply notification: ${context.space.name}`
    } else {
      return `[precisionFDA] New Public Discussion notification`
    }
  }
}
