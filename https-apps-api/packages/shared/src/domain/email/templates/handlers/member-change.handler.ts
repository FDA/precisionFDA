import { pipe, filter, uniqBy } from 'ramda'
import { LoadedReference } from '@mikro-orm/core'
import { errors } from '../../../..'
import { User, SpaceMembership, Space } from '../../..'
import {
  EmailSendInput,
  EmailTemplate,
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
    user: LoadedReference<User, User>
  }

  async setupContext(): Promise<void> {
    this.space = await this.ctx.em.findOneOrFail(Space, {
      id: this.validatedInput.spaceId,
    })
    if (!this.space) {
      throw new errors.NotFoundError(
        `Space id ${this.validatedInput.spaceId.toString()} not found`,
        { code: errors.ErrorCodes.EMAIL_PAYLOAD_NOT_FOUND },
      )
    }
    this.user = await this.ctx.em.findOneOrFail(User, { id: this.validatedInput.initUserId })
    if (!this.user) {
      throw new errors.NotFoundError(
        `User id ${this.validatedInput.initUserId.toString()} not found`,
        { code: errors.ErrorCodes.EMAIL_PAYLOAD_NOT_FOUND },
      )
    }
    this.updatedMembership = await this.ctx.em.findOneOrFail(
      SpaceMembership,
      {
        id: this.validatedInput.updatedMembershipId,
      },
      { populate: ['user'] },
    )
    if (!this.updatedMembership) {
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
    const membershipAddedRemovedKeys = [SPACE_EVENT_ACTIVITY_TYPE.membership_added]
    const currentKey = SPACE_EVENT_ACTIVITY_TYPE[this.validatedInput.activityType]
    // todo: member removed space event key ???
    if (membershipChangeKeys.includes(currentKey)) {
      return 'membership_changed'
    }
    if (membershipAddedRemovedKeys.includes(currentKey)) {
      return 'member_added_or_removed_from_space'
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
    // this has to be bound to local
    const filterUsers = pipe(
      // SpaceMembership[] -> User[]
      filterFn,
      // this user triggered the SpaceEvent
      filter((u: User) => u.id !== spaceEventUserId),
      filter((u: User) => !u.isChallengeBot()),
      uniqBy((user: User) => user.id),
    )
    const result = filterUsers(memberships)
    // based on email type, find who will be the receiver
    // users who are in the space + active ?
    return result
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
      to: receiver.email,
      body,
      subject: `${content.initiator.fullName} ${content.action}`,
    }
  }
}
