import { pipe, map, filter, uniqBy } from 'ramda'
import { errors } from '../../../..'
import { User, SpaceEvent, SpaceMembership } from '../../..'
import { EmailSendInput, EmailTemplate, MemberChanged } from '../../email.config'
import { SPACE_EVENT_ACTIVITY_TYPE } from '../../../space-event/space-event.enum'
import { BaseTemplate } from '../base-template'
import { memberChangedTemplate, MemberChangeTemplateInput } from '../mjml/member-change.template'

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
  extends BaseTemplate<MemberChanged, MemberChangeTemplateInput>
  implements EmailTemplate {
  templateFile = memberChangedTemplate

  async determineReceivers(): Promise<User[]> {
    const spaceEvent = await this.ctx.em.findOneOrFail(
      SpaceEvent,
      {
        id: this.validatedInput.spaceEventId,
      },
      { populate: ['space'] },
    )

    const memberships = await this.ctx.em.find(
      SpaceMembership,
      { spaces: spaceEvent.space.id, active: true },
      { populate: ['user.emailNotificationSettings'] },
    )
    // this has to be bound to local
    const scopedFn: () => User[] = this.filterByUserSettings.bind(this)
    const filterUsers = pipe(
      map((m: SpaceMembership) => m.user.unwrap()),
      // this user triggered the SpaceEvent
      filter((u: User) => u.id !== spaceEvent.user.id),
      filter((u: User) => u.isChallengeBot()),
      uniqBy((user: User) => user.id),
      scopedFn,
    )
    const result = filterUsers(memberships)
    // based on email type, find who will be the receiver
    // users who are in the space + active ?
    return result
  }

  async getTemplateContent(): Promise<MemberChangeTemplateInput['content']> {
    const spaceEvent = await this.ctx.em.findOne(
      SpaceEvent,
      {
        id: this.validatedInput.spaceEventId,
      },
      { populate: ['space', 'user'] },
    )
    if (!spaceEvent || !spaceEvent.user.unwrap() || !spaceEvent.space.unwrap()) {
      throw new errors.NotFoundError(
        `SpaceEvent id ${this.validatedInput.spaceEventId.toString()} not found`,
        { code: errors.ErrorCodes.EMAIL_PAYLOAD_NOT_FOUND },
      )
    }
    const membership = await this.ctx.em.findOne(
      SpaceMembership,
      { id: spaceEvent.entityId },
      { populate: ['user'] },
    )
    if (!membership || !membership.user.unwrap()) {
      throw new errors.NotFoundError(
        `New space member id ${spaceEvent.entityId.toString()} not found`,
        { code: errors.ErrorCodes.EMAIL_PAYLOAD_NOT_FOUND },
      )
    }
    const actionValue = ACTION_NAMES[spaceEvent.activityType]
    if (!actionValue) {
      throw new errors.NotFoundError(
        `SpaceEvent id ${this.validatedInput.spaceEventId.toString()} does not correspond with required action type for given email`,
        { code: errors.ErrorCodes.EMAIL_PAYLOAD_NOT_FOUND },
      )
    }

    return {
      initiator: { fullName: spaceEvent.user.unwrap().fullName },
      action: actionValue,
      space: { name: spaceEvent.space.unwrap().name },
      newMember: { fullName: membership.user.unwrap().fullName, role: membership.role.toString() },
    }
  }

  async template(receiver: User): Promise<EmailSendInput> {
    const content = await this.getTemplateContent()
    const body = this.buildTemplateHtml({ receiver, content })
    return {
      to: receiver.email,
      body,
      subject: 'todo',
    }
  }
}
