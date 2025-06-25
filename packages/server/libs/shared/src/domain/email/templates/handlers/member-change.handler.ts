import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { Space } from '@shared/domain/space/space.entity'
import { User } from '@shared/domain/user/user.entity'
import { ErrorCodes, NotFoundError } from '@shared/errors'
import { LoadedReference } from '@mikro-orm/core'
import { NOTIFICATION_TYPES_BASE } from '../../email.config'
import { SPACE_EVENT_ACTIVITY_TYPE } from '../../../space-event/space-event.enum'
import { SPACE_MEMBERSHIP_ROLE } from '../../../space-membership/space-membership.enum'
import { memberChangedTemplate } from '../mjml/member-change.template'
import { getKeyForUserSpaceRole } from '../../email.helper'
import { MemberChangedDTO } from '@shared/domain/email/dto/member-changed.dto'
import { Injectable } from '@nestjs/common'
import { EmailHandler } from '@shared/domain/email/templates/handlers/email.handler'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { EmailClient } from '@shared/services/email-client'
import { EmailTypeToTemplateInputMap } from '@shared/domain/email/dto/email-type-to-template-input.map'
import { SpaceRepository } from '@shared/domain/space/space.repository'
import { UserRepository } from '@shared/domain/user/user.repository'
import { SpaceMembershipRepository } from '@shared/domain/space-membership/space-membership.repository'
import {
  EmailTypeToContextMap,
  MemberChangedContext,
} from '@shared/domain/email/dto/email-type-to-context.map'

type ActionNames = {
  [s in keyof typeof SPACE_EVENT_ACTIVITY_TYPE]?: string
}
const ACTION_NAMES: ActionNames = {
  membership_added: 'added a new member',
  membership_disabled: 'disabled a member',
  membership_changed: 'changed role of member',
  membership_enabled: 'enabled member',
} as const

@Injectable()
export class MemberChangedEmailHandler extends EmailHandler<EMAIL_TYPES.memberChangedAddedRemoved> {
  protected emailType = EMAIL_TYPES.memberChangedAddedRemoved as const
  protected inputDto = MemberChangedDTO
  protected getBody = memberChangedTemplate

  constructor(
    protected readonly em: SqlEntityManager,
    protected readonly spaceRepo: SpaceRepository,
    protected readonly userRepo: UserRepository,
    protected readonly spaceMembershipRepo: SpaceMembershipRepository,
    protected readonly emailClient: EmailClient,
  ) {
    super(emailClient)
  }

  protected async getContextualData(
    input: MemberChangedDTO,
  ): Promise<EmailTypeToContextMap[EMAIL_TYPES.memberChangedAddedRemoved]> {
    let space: Space
    try {
      space = await this.spaceRepo.findOneOrFail({
        id: input.spaceId,
      })
    } catch (err) {
      this.logger.error({ err }, 'space not found - DB error')
      throw new NotFoundError(`Space id ${input.spaceId} not found`, {
        code: ErrorCodes.SPACE_NOT_FOUND,
      })
    }
    let user: User
    try {
      user = await this.userRepo.findOneOrFail({ id: input.initUserId })
    } catch (err) {
      this.logger.error({ err }, 'user in space not found - DB error')
      throw new NotFoundError(`User id ${input.initUserId} not found`, {
        code: ErrorCodes.EMAIL_PAYLOAD_NOT_FOUND,
      })
    }

    let updatedMembership: SpaceMembership
    try {
      updatedMembership = await this.spaceMembershipRepo.findOneOrFail(
        {
          id: input.updatedMembershipId,
        },
        { populate: ['user'] },
      )
    } catch (err) {
      this.logger.error({ err }, 'updated space membership in space not found - DB error')
      throw new NotFoundError(`Space membership id ${input.updatedMembershipId} not found`, {
        code: ErrorCodes.EMAIL_PAYLOAD_NOT_FOUND,
      })
    }

    const content = await this.getTemplateContent(
      updatedMembership as SpaceMembership & { user: LoadedReference<User> },
      user,
      space,
      input,
    )
    return {
      input,
      space,
      activityType: input.activityType,
      user,
      content,
      updatedMembership: updatedMembership as SpaceMembership & { user: LoadedReference<User> },
    }
  }

  private getActionStr(input: MemberChangedDTO): string {
    // todo: should filter if activityType belongs here
    const activityKey = input.activityType
    const actionValue = ACTION_NAMES[activityKey]
    if (!actionValue) {
      throw new NotFoundError(
        `SpaceEvent with activityType id ${activityKey.toString()} does not
        correspond with action types for the email`,
        { code: ErrorCodes.EMAIL_PAYLOAD_NOT_FOUND },
      )
    }
    return actionValue
  }

  protected async getNotificationSettingKeys(
    context: MemberChangedContext,
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
      return [
        getKeyForUserSpaceRole(
          spaceMembership[0],
          this.getNotificationKey(context.activityType),
          space,
        ),
      ]
    }
  }

  private getNotificationKey(activityType: string): keyof typeof NOTIFICATION_TYPES_BASE {
    const membershipChangeKeys = [
      SPACE_EVENT_ACTIVITY_TYPE.membership_changed,
      SPACE_EVENT_ACTIVITY_TYPE.membership_enabled,
      SPACE_EVENT_ACTIVITY_TYPE.membership_disabled,
    ]
    const membershipAddingKey = [SPACE_EVENT_ACTIVITY_TYPE.membership_added]
    const currentKey = SPACE_EVENT_ACTIVITY_TYPE[activityType]
    if (membershipChangeKeys.includes(currentKey)) {
      return 'membership_changed'
    }
    if (membershipAddingKey.includes(currentKey)) {
      return 'member_added_to_space'
    }
    throw new Error(`Unknown activityType value ${activityType}`)
  }

  async determineReceivers(context: MemberChangedContext): Promise<User[]> {
    const memberships = await this.spaceMembershipRepo.find(
      { spaces: context.space.id, active: true },
      { populate: ['user.notificationPreference'] },
    )

    const spaceEventUserId = context.user.id
    const userMembership = memberships.filter((memberShip) => {
      if (memberShip.user.id === spaceEventUserId) {
        return memberShip
      }
    })

    const receiverMembershipForAdding = memberships.filter((membership) => {
      if (
        membership &&
        membership.side === userMembership[0].side &&
        [SPACE_MEMBERSHIP_ROLE.ADMIN, SPACE_MEMBERSHIP_ROLE.LEAD].includes(membership.role)
      ) {
        return membership
      }
    })

    const receiverMembershipForChanging = memberships.filter((membership) => {
      if (membership && membership.side === userMembership[0].side) {
        return membership
      }
    })

    let receivers
    // membership_added
    if (context.input.activityType === 'membership_added') {
      receivers = receiverMembershipForAdding.map((membership) => membership.user)
    } else {
      // other actions for membership: enable/disable/role change
      receivers = receiverMembershipForChanging.map((membership) => membership.user)
      if (
        context.input.activityType === 'membership_enabled' &&
        !context.updatedMembership.active
      ) {
        const enabledUser = await this.em.findOneOrFail(
          User,
          {
            id: context.updatedMembership.user.id,
          },
          { populate: ['notificationPreference'] },
        )
        receivers.push(enabledUser)
      }
    }

    return receivers.filter((user: User) => user.id !== spaceEventUserId)
  }

  private async getTemplateContent(
    updatedMembership: SpaceMembership & {
      user: LoadedReference<User>
    },
    user: User,
    space: Space,
    input: MemberChangedDTO,
  ): Promise<{
    initiator: { fullName: string }
    action: string
    space: { name: string; id: number }
    newMember: {
      fullName: string
      role: string
    }
  }> {
    const membership = updatedMembership
    if (!membership || !membership.user.unwrap()) {
      throw new NotFoundError(
        `New space member id ${input.updatedMembershipId.toString()} not found`,
        { code: ErrorCodes.EMAIL_PAYLOAD_NOT_FOUND },
      )
    }

    const action = this.getActionStr(input)
    // an override from request input can be provided
    const role = input.newMembershipRole ?? SPACE_MEMBERSHIP_ROLE[membership.role]

    return {
      initiator: { fullName: user.fullName },
      action,
      space: { name: space.name, id: space.id },
      newMember: {
        fullName: membership.user.unwrap().fullName,
        role,
      },
    }
  }

  protected getSubject(_receiver: User, context: MemberChangedContext): string {
    return `${context.content.initiator.fullName} ${context.content.action}`
  }

  protected getTemplateInput(
    receiver: User,
    context: MemberChangedContext,
  ): EmailTypeToTemplateInputMap[EMAIL_TYPES.memberChangedAddedRemoved] {
    return {
      receiver,
      content: context.content,
    }
  }
}
