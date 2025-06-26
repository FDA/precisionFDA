import { EmailHandler } from '@shared/domain/email/templates/handlers/email.handler'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { Injectable } from '@nestjs/common'
import { DiscussionDTO } from '@shared/domain/email/dto/discussion.dto'
import { newDiscussionReplyTemplate } from '@shared/domain/email/templates/mjml/new-discussion-reply.template'
import DiscussionRepository from '@shared/domain/discussion/discussion.repository'
import { SpaceRepository } from '@shared/domain/space/space.repository'
import { UserRepository } from '@shared/domain/user/user.repository'
import { SpaceMembershipRepository } from '@shared/domain/space-membership/space-membership.repository'
import { EntityService } from '@shared/domain/entity/entity.service'
import { EmailClient } from '@shared/services/email-client'
import {
  EmailTypeToContextMap,
  NewDiscussionReplyContext,
} from '@shared/domain/email/dto/email-type-to-context.map'
import * as errors from '../../../../errors'
import { User, USER_STATE } from '@shared/domain/user/user.entity'
import { EntityScopeUtils } from '@shared/utils/entity-scope.utils'
import { EmailTypeToTemplateInputMap } from '@shared/domain/email/dto/email-type-to-template-input.map'
import { Space } from '@shared/domain/space/space.entity'
import { getKeyForUserSpaceRole } from '@shared/domain/email/email.helper'

@Injectable()
export class NewDiscussionReplyHandler extends EmailHandler<EMAIL_TYPES.newDiscussionReply> {
  protected emailType = EMAIL_TYPES.newDiscussionReply as const
  protected inputDto = DiscussionDTO
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
    input: DiscussionDTO,
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

  protected async getNotificationSettingKeys(
    context: NewDiscussionReplyContext,
    user: User,
  ): Promise<string[]> {
    const space = context.space
    await space.spaceMemberships.loadItems()
    const spaceMembership = space.spaceMemberships
      .getItems()
      .filter(
        (spaceMembership) =>
          spaceMembership.active === true && spaceMembership.user.getEntity().id === user.id,
      )

    if (Array.isArray(spaceMembership) && spaceMembership.length > 0) {
      return [getKeyForUserSpaceRole(spaceMembership[0], 'comment_activity', space)]
    }
  }

  /**
   * Get all users following the discussion, including the discussion owner.
   * Only currently active users are returned.
   * @param discussionId
   */
  async getFollowers(discussionId: number): Promise<User[]> {
    const discussion = await this.discussionRepo.findOne({ id: discussionId })
    if (!discussion) {
      throw new errors.NotFoundError('Discussion not found.')
    }
    await discussion.follows.load()
    // filter out only user ids
    const userIDs = discussion.follows
      .getItems()
      .filter((follow) => follow.followerType === 'User')
      .map((follow) => follow.followerId)

    return await this.userRepo.find({ id: { $in: userIDs }, userState: USER_STATE.ENABLED })
  }

  protected async determineReceivers(
    context: EmailTypeToContextMap[EMAIL_TYPES.newDiscussionReply],
  ): Promise<User[]> {
    let users = await this.getFollowers(context.input.discussionId)

    if (EntityScopeUtils.isSpaceScope(context.discussion.note.getEntity().scope)) {
      this.logger.log('Discussion is in space....')

      if (context.input.notify === 'all') {
        const spaceMemberships = await this.spaceMembershipRepo.find(
          { spaces: context.space.id, active: true },
          { populate: ['user', 'user.notificationPreference'] },
        )
        return spaceMemberships.map((spaceMembership) => spaceMembership.user.getEntity())
      }

      if (context.input.notify === 'author') {
        users.push(context.discussion.user.getEntity())
      }

      if (Array.isArray(context.input.notify) && context.input.notify.length) {
        const users = await Promise.all(
          context.input.notify.map((username) =>
            this.userRepo.findOneOrFail(
              {
                dxuser: username,
                spaceMemberships: { spaces: context.space.id, active: true },
              },
              { populate: ['notificationPreference'] },
            ),
          ),
        )
        users.push(...users)
      }
    }
    return Array.from(new Set(users.map((user) => user.id))).map(
      (id) => users.find((user) => user.id === id)!,
    )
  }

  protected getTemplateInput(
    _receiver: User,
    contextObject: EmailTypeToContextMap[EMAIL_TYPES.newDiscussionReply],
  ): EmailTypeToTemplateInputMap[EMAIL_TYPES.newDiscussionReply] {
    return {
      url: contextObject.discussionLink,
      spaceName: EntityScopeUtils.isSpaceScope(contextObject.discussion.note.getEntity().scope)
        ? contextObject.space.name
        : null,
    }
  }

  protected getSubject(_receiver: User, context: NewDiscussionReplyContext): string {
    if (EntityScopeUtils.isSpaceScope(context.discussion.note.getEntity().scope)) {
      return `[precisionFDA] New Discussion reply notification: ${context.space.name}`
    } else {
      return `[precisionFDA] New Public Discussion notification`
    }
  }
}
