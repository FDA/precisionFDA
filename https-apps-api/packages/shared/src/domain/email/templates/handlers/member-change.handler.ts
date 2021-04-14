import { pipe, filter, uniqBy } from 'ramda'
import { errors } from '../../../..'
import { User, SpaceEvent, SpaceMembership } from '../../..'
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
  spaceEvent: SpaceEvent

  async setupContext(): Promise<void> {
    this.spaceEvent = await this.ctx.em.findOneOrFail(
      SpaceEvent,
      { id: this.validatedInput.spaceEventId },
      { populate: ['space', 'user'] },
    )
    if (!this.spaceEvent || !this.spaceEvent.user.unwrap() || !this.spaceEvent.space.unwrap()) {
      throw new errors.NotFoundError(
        `SpaceEvent id ${this.validatedInput.spaceEventId.toString()} not found`,
        { code: errors.ErrorCodes.EMAIL_PAYLOAD_NOT_FOUND },
      )
    }
  }

  getActionStr(): string {
    const activityKey = SPACE_EVENT_ACTIVITY_TYPE[this.spaceEvent.activityType]
    const actionValue = ACTION_NAMES[activityKey]
    if (!actionValue) {
      throw new errors.NotFoundError(
        `SpaceEvent id ${this.validatedInput.spaceEventId.toString()} does not
        correspond with action types for the email`,
        { code: errors.ErrorCodes.EMAIL_PAYLOAD_NOT_FOUND },
      )
    }
    return actionValue
  }

  getNotificationKey(spaceEvent: SpaceEvent): keyof typeof NOTIFICATION_TYPES_BASE {
    const membershipChangeKeys = [
      SPACE_EVENT_ACTIVITY_TYPE.membership_changed,
      SPACE_EVENT_ACTIVITY_TYPE.membership_enabled,
      SPACE_EVENT_ACTIVITY_TYPE.membership_disabled,
    ]
    const membershipAddedRemovedKeys = [SPACE_EVENT_ACTIVITY_TYPE.membership_added]
    // todo: member removed space event key ???
    if (membershipChangeKeys.includes(spaceEvent.activityType)) {
      return 'membership_changed'
    }
    if (membershipAddedRemovedKeys.includes(spaceEvent.activityType)) {
      return 'member_added_or_removed_from_space'
    }
    throw new Error(`Unknown activityType value ${spaceEvent.activityType}`)
  }

  async determineReceivers(): Promise<User[]> {
    const memberships = await this.ctx.em.find(
      SpaceMembership,
      { spaces: this.spaceEvent.space.id, active: true },
      { populate: ['user.emailNotificationSettings'] },
    )
    const isEnabledFn = buildIsNotificationEnabled(
      this.getNotificationKey(this.spaceEvent),
      this.ctx,
    )
    const filterFn = buildFilterByUserSettings({ ...this.ctx, config: this.config }, isEnabledFn)

    const spaceEventUserId = this.spaceEvent.user.id
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
    const membership = await this.ctx.em.findOne(
      SpaceMembership,
      { id: this.spaceEvent.entityId },
      { populate: ['user'] },
    )
    if (!membership || !membership.user.unwrap()) {
      throw new errors.NotFoundError(
        `New space member id ${this.spaceEvent.entityId.toString()} not found`,
        { code: errors.ErrorCodes.EMAIL_PAYLOAD_NOT_FOUND },
      )
    }

    const action = this.getActionStr()

    return {
      initiator: { fullName: this.spaceEvent.user.unwrap().fullName },
      action,
      space: { name: this.spaceEvent.space.unwrap().name },
      newMember: {
        fullName: membership.user.unwrap().fullName,
        role: SPACE_MEMBERSHIP_ROLE[membership.role],
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
