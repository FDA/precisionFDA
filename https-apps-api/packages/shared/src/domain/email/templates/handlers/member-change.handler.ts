import { filter, pipe, uniqBy } from 'ramda'
import { LoadedReference } from '@mikro-orm/core'
import { errors } from '../../../..'
import { Space, SpaceMembership, User } from '../../..'
import {
  EmailSendInput,
  EmailTemplate,
  EMAIL_TYPES,
  MemberChanged,
  NOTIFICATION_TYPES_BASE,
} from '../../email.config'
import { SPACE_EVENT_ACTIVITY_TYPE } from '../../../space-event/space-event.enum'
import { SPACE_MEMBERSHIP_ROLE } from '../../../space-membership/space-membership.enum'
import { BaseTemplate } from '../base-template'
import { memberChangedTemplate, MemberChangeTemplateInput } from '../mjml/member-change.template'
import {
  buildEmailTemplate,
  buildFilterByUserSettings,
  buildIsNotificationEnabled,
} from '../../email.helper'

type ActionNames = {
  [s in keyof typeof SPACE_EVENT_ACTIVITY_TYPE]?: string
}
const ACTION_NAMES: ActionNames = {
  membership_added: 'added a new member',
  membership_disabled: 'disabled a member',
  membership_changed: 'changed role of member',
  membership_enabled: 'enabled member',
} as const

export class MemberChangedEmailHandler
  extends BaseTemplate<MemberChanged>
  implements EmailTemplate {
  templateFile = memberChangedTemplate
  space: Space
  user: User
  updatedMembership: SpaceMembership & {
    user: LoadedReference<User>
  }

  async setupContext(): Promise<void> {
    try {
      this.space = await this.ctx.em.findOneOrFail(Space, {
        id: this.validatedInput.spaceId,
      })
    } catch (err) {
      this.ctx.log.error({ err }, 'space not found - DB error')
      throw new errors.NotFoundError(
        `Space id ${this.validatedInput.spaceId.toString()} not found`,
        {
          code: errors.ErrorCodes.SPACE_NOT_FOUND,
        },
      )
    }
    try {
      this.user = await this.ctx.em.findOneOrFail(User, { id: this.validatedInput.initUserId })
    } catch (err) {
      this.ctx.log.error({ err }, 'user in space not found - DB error')
      throw new errors.NotFoundError(
        `User id ${this.validatedInput.initUserId.toString()} not found`,
        { code: errors.ErrorCodes.EMAIL_PAYLOAD_NOT_FOUND },
      )
    }

    try {
      this.updatedMembership = await this.ctx.em.findOneOrFail(
        SpaceMembership,
        {
          id: this.validatedInput.updatedMembershipId,
        },
        { populate: ['user'] },
      )
    } catch (err) {
      this.ctx.log.error({ err }, 'updated space membership in space not found - DB error')
      throw new errors.NotFoundError(
        `Space membership id ${this.validatedInput.updatedMembershipId.toString()} not found`,
        { code: errors.ErrorCodes.EMAIL_PAYLOAD_NOT_FOUND },
      )
    }
  }

  getActionStr(): string {
    // todo: should filter if activityType belongs here
    const activityKey = this.validatedInput.activityType
    const actionValue = ACTION_NAMES[activityKey]
    if (!actionValue) {
      throw new errors.NotFoundError(
        `SpaceEvent with activityType id ${activityKey.toString()} does not
        correspond with action types for the email`,
        { code: errors.ErrorCodes.EMAIL_PAYLOAD_NOT_FOUND },
      )
    }
    return actionValue
  }

  getNotificationKey(): keyof typeof NOTIFICATION_TYPES_BASE {
    const membershipChangeKeys = [
      SPACE_EVENT_ACTIVITY_TYPE.membership_changed,
      SPACE_EVENT_ACTIVITY_TYPE.membership_enabled,
      SPACE_EVENT_ACTIVITY_TYPE.membership_disabled,
    ]
    const membershipAddingKey = [SPACE_EVENT_ACTIVITY_TYPE.membership_added]
    const currentKey = SPACE_EVENT_ACTIVITY_TYPE[this.validatedInput.activityType]
    if (membershipChangeKeys.includes(currentKey)) {
      return 'membership_changed'
    }
    if (membershipAddingKey.includes(currentKey)) {
      return 'member_added_to_space'
    }
    throw new Error(`Unknown activityType value ${this.validatedInput.activityType}`)
  }

  async determineReceivers(): Promise<User[]> {
    const memberships = await this.ctx.em.find(
      SpaceMembership,
      { spaces: this.space.id, active: true },
      { populate: ['user.emailNotificationSettings'] },
    )
    const isEnabledFn = buildIsNotificationEnabled(this.getNotificationKey(), this.ctx)
    const filterFn = buildFilterByUserSettings({ ...this.ctx, config: this.config }, isEnabledFn)
    const spaceEventUserId = this.user.id
    const userMembership: any = memberships.filter(memberShip => {
      if (memberShip.user.id === spaceEventUserId) {
        return memberShip
      }
    })

    const receiverMembershipForAdding: any = memberships.filter(memberShip => {
      if (userMembership &&
          memberShip.side === userMembership[0].side &&
          memberShip.user.id !== spaceEventUserId &&
          [SPACE_MEMBERSHIP_ROLE.ADMIN, SPACE_MEMBERSHIP_ROLE.LEAD].includes(memberShip.role)
      ) {
        return memberShip
      }
    })

    const receiverMembershipForChanging: any = memberships.filter(memberShip => {
      if (userMembership &&
        memberShip.side === userMembership[0].side &&
        memberShip.user.id !== spaceEventUserId
      ) {
        return memberShip
      }
    })

    // this has to be bound to local
    const filterUsers = pipe(
      // SpaceMembership[] -> User[]
      filterFn,
      // this user triggered the SpaceEvent
      filter((u: User) => u.id !== spaceEventUserId),
      filter((u: User) => !u.isChallengeBot()),
      uniqBy((user: User) => user.id),
    )
    let receivers
    // membership_added
    if(this.validatedInput.activityType === 'membership_added') {
      receivers = filterUsers(receiverMembershipForAdding)
    } else { // other actions for membership: enable/disable/role change
      receivers = filterUsers(receiverMembershipForChanging)
      if(this.validatedInput.activityType === 'membership_enabled' &&
        !this.updatedMembership.active) {
        const enabledUser = await this.ctx.em.findOneOrFail(User, { id: this.updatedMembership.user.id })
        receivers.push(enabledUser)
      }
    }
    return receivers
  }

  async getTemplateContent(): Promise<MemberChangeTemplateInput['content']> {
    const membership = this.updatedMembership
    if (!membership || !membership.user.unwrap()) {
      throw new errors.NotFoundError(
        `New space member id ${this.validatedInput.updatedMembershipId.toString()} not found`,
        { code: errors.ErrorCodes.EMAIL_PAYLOAD_NOT_FOUND },
      )
    }

    const action = this.getActionStr()
    // an override from request input can be provided
    const role = this.validatedInput.newMembershipRole ?? SPACE_MEMBERSHIP_ROLE[membership.role]

    return {
      initiator: { fullName: this.user.fullName },
      action,
      space: { name: this.space.name, id: this.space.id },
      newMember: {
        fullName: membership.user.unwrap().fullName,
        role,
      },
    }
  }

  async template(receiver: User): Promise<EmailSendInput> {
    const content = await this.getTemplateContent()
    const body = buildEmailTemplate<MemberChangeTemplateInput>(this.templateFile, {
      receiver,
      content,
    })
    return {
      emailType: EMAIL_TYPES.memberChangedAddedRemoved,
      to: receiver.email,
      body,
      subject: `${content.initiator.fullName} ${content.action}`,
    }
  }
}
