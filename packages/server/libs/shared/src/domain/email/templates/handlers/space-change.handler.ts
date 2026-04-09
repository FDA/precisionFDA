import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable } from '@nestjs/common'
import { EmailTypeToContextMap, SpaceChangedContext } from '@shared/domain/email/dto/email-type-to-context.map'
import { EmailTypeToTemplateInputMap } from '@shared/domain/email/dto/email-type-to-template-input.map'
import { SpaceChangedDTO } from '@shared/domain/email/dto/space-changed.dto'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { EmailHandler } from '@shared/domain/email/templates/handlers/email.handler'
import { SpaceRepository } from '@shared/domain/space/space.repository'
import { SPACE_MEMBERSHIP_SIDE } from '@shared/domain/space-membership/space-membership.enum'
import { SpaceMembershipRepository } from '@shared/domain/space-membership/space-membership.repository'
import { User } from '@shared/domain/user/user.entity'
import { UserRepository } from '@shared/domain/user/user.repository'
import { ErrorCodes, NotFoundError } from '@shared/errors'
import { EmailClient } from '@shared/services/email-client'
import { getKeyForUserSpaceRole } from '../../email.helper'
import { spaceChangedTemplate } from '../mjml/space-change.template'

@Injectable()
export class SpaceChangedEmailHandler extends EmailHandler<EMAIL_TYPES.spaceChanged> {
  protected emailType = EMAIL_TYPES.spaceChanged as const
  protected inputDto = SpaceChangedDTO
  protected getBody = spaceChangedTemplate

  constructor(
    protected readonly em: SqlEntityManager,
    protected readonly spaceRepo: SpaceRepository,
    protected readonly userRepo: UserRepository,
    protected readonly spaceMembershipRepo: SpaceMembershipRepository,
    protected readonly emailClient: EmailClient,
  ) {
    super(emailClient)
  }

  protected async getContextualData(input: SpaceChangedDTO): Promise<EmailTypeToContextMap[EMAIL_TYPES.spaceChanged]> {
    const space = await this.spaceRepo.findOneOrFail({
      id: input.spaceId,
    })
    if (!space) {
      throw new NotFoundError(`Space id ${input.spaceId} not found`, {
        code: ErrorCodes.EMAIL_PAYLOAD_NOT_FOUND,
      })
    }
    const user = await this.userRepo.findOneOrFail({ id: input.initUserId })
    if (!user) {
      throw new NotFoundError(`User id ${input.initUserId} not found`, {
        code: ErrorCodes.EMAIL_PAYLOAD_NOT_FOUND,
      })
    }

    const spaceMemberships = await this.spaceMembershipRepo.find(
      { spaces: space.id, active: true },
      { populate: ['user.notificationPreference'] },
    )

    const spaceMembership = spaceMemberships.find(membership => membership.user.id === user.id)

    let spaceMembershipSide = {}
    if (spaceMemberships[0]) {
      spaceMembershipSide = SPACE_MEMBERSHIP_SIDE[spaceMemberships[0].side]
    }
    const receiverMembershipSide = {} // future need
    const receiversSides = {}

    return {
      input,
      space,
      user,
      receiversSides,
      spaceMembership,
      spaceMembershipSide,
      receiverMembershipSide,
    }
  }

  protected async getNotificationSettingKeys(context: SpaceChangedContext): Promise<string[]> {
    const space = context.space
    await space.spaceMemberships.loadItems()
    const spaceMembership = space.spaceMemberships.getItems().filter(spaceMembership => spaceMembership.active === true)

    if (Array.isArray(spaceMembership) && spaceMembership.length > 0) {
      return [getKeyForUserSpaceRole(spaceMembership[0], 'space_locked_unlocked_deleted', space)]
    }
  }

  protected async determineReceivers(context: SpaceChangedContext): Promise<User[]> {
    const memberships = await this.spaceMembershipRepo.find(
      { spaces: context.space.id, active: true },
      { populate: ['user.notificationPreference'] },
    )

    return memberships.map(membership => membership.user.getEntity()).filter(user => context.user.id !== user.id)
  }

  private getAction(activityType: string): string {
    return activityType.split('_').slice(1).join(' ')
  }

  protected getTemplateInput(
    context: SpaceChangedContext,
    receiver?: User,
  ): EmailTypeToTemplateInputMap[EMAIL_TYPES.spaceChanged] {
    const action = this.getAction(context.input.activityType)
    return {
      content: {
        space: { name: context.space.name, id: context.space.id },
        action,
        initiator: { fullName: context.user.fullName },
        spaceMembership: {
          side: context.spaceMembership ? context.spaceMembership.side : undefined,
        },
        spaceMembershipSide: context.spaceMembershipSide.toString(),
        receiverMembershipSide: context.receiverMembershipSide.toString(),
        receiversSides: context.receiversSides,
      },
      firstName: receiver?.firstName,
    }
  }

  protected getSubject(context: SpaceChangedContext): string {
    return `${context.user.fullName} ${this.getAction(context.input.activityType)} the space ${context.space.name}`
  }
}
