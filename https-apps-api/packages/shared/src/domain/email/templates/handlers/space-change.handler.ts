import { pipe, filter, uniqBy } from 'ramda'
import type { LoadedReference } from '@mikro-orm/core'
import { errors } from '../../../..'
import { User, SpaceEvent, SpaceMembership, Space } from '../../..'
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
import { SPACE_EVENT_ACTIVITY_TYPE } from 'shared/dist/domain/space-event/space-event.enum'

export class SpaceChangedEmailHandler extends BaseTemplate<SpaceChanged> implements EmailTemplate {
  templateFile = spaceChangedTemplate
  spaceEvent: SpaceEvent & {
    space: LoadedReference<Space, Space>
    user: LoadedReference<User, User>
  }

  getNotificationKey(): keyof typeof NOTIFICATION_TYPES_BASE {
    return 'space_locked_unlocked_deleted'
  }

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

  async determineReceivers(): Promise<User[]> {
    const memberships = await this.ctx.em.find(
      SpaceMembership,
      { spaces: this.spaceEvent.space.id, active: true },
      { populate: ['user.emailNotificationSettings'] },
    )
    const isEnabledFn = buildIsNotificationEnabled(this.getNotificationKey(), this.ctx)
    const filterFn = buildFilterByUserSettings({ ...this.ctx, config: this.config }, isEnabledFn)

    const spaceEventUserId = this.spaceEvent.user.id
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
    const actionKey = SPACE_EVENT_ACTIVITY_TYPE[this.spaceEvent.activityType]
    // todo: validate the incoming action?
    const action = actionKey.split('_').join(' ')
    return {
      space: { name: this.spaceEvent.space.unwrap().name },
      action,
      initiator: { fullName: this.spaceEvent.user.unwrap().fullName },
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
