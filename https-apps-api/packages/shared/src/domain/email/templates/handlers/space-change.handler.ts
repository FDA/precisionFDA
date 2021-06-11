import { pipe, filter, uniqBy } from 'ramda'
import { errors } from '../../../..'
import { User, SpaceMembership, Space } from '../../..'
import {
  EmailSendInput,
  EmailTemplate,
  SpaceChanged,
  NOTIFICATION_TYPES_BASE,
} from '../../email.config'
import { BaseTemplate } from '../base-template'
import { SpaceChangeTemplateInput, spaceChangedTemplate } from '../mjml/space-change.template'
import {
  buildEmailTemplate,
  buildFilterByUserSettings,
  buildIsNotificationEnabled,
} from '../../email.helper'

export class SpaceChangedEmailHandler extends BaseTemplate<SpaceChanged> implements EmailTemplate {
  templateFile = spaceChangedTemplate
  space: Space
  user: User

  getNotificationKey(): keyof typeof NOTIFICATION_TYPES_BASE {
    return 'space_locked_unlocked_deleted'
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
      uniqBy((user: User) => user.id),
    )
    const result = filterUsers(memberships)
    // based on email type, find who will be the receiver
    // users who are in the space + active ?
    return result
  }

  // eslint-disable-next-line @typescript-eslint/require-await, require-await
  async getTemplateContent(): Promise<SpaceChangeTemplateInput['content']> {
    // todo: validate the incoming action?
    const actionKey = this.validatedInput.activityType
    const action = actionKey.split('_').slice(1).join(' ')
    return {
      space: { name: this.space.name, id: this.space.id },
      action,
      initiator: { fullName: this.user.fullName },
    }
  }

  async template(receiver: User): Promise<EmailSendInput> {
    const content = await this.getTemplateContent()
    const body = buildEmailTemplate<SpaceChangeTemplateInput>(this.templateFile, {
      receiver,
      content,
    })
    return {
      to: receiver.email,
      body,
      subject: `${content.initiator.fullName} ${content.action} the space ${content.space.name}`,
    }
  }
}
