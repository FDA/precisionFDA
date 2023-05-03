import { filter, pipe, uniqBy, isNil } from 'ramda'
import {
  EmailSendInput,
  EmailTemplate,
  EMAIL_TYPES,
  NewContentAdded,
  NOTIFICATION_TYPES_BASE,
} from '../../email.config'
import {
  buildIsNotificationEnabled,
  buildFilterByUserSettings,
  buildEmailTemplate,
} from '../../email.helper'
import { SpaceMembership, User } from '../../..'
import { errors } from '../../../..'
import { SpaceEvent } from '../../../space-event'
import {
  SPACE_EVENT_ACTIVITY_TYPE,
  SPACE_EVENT_OBJECT_TYPE,
} from '../../../space-event/space-event.enum'
import { newContentTemplate, NewContentTemplateInput } from '../mjml/new-content.template'
import { BaseTemplate } from '..'

export class ContentChangedEmailHandler
  extends BaseTemplate<NewContentAdded>
  implements EmailTemplate {
  templateFile = newContentTemplate
  templateContent?: NewContentTemplateInput['content']

  async setupContext(): Promise<void> {}

  getNotificationKey(): keyof typeof NOTIFICATION_TYPES_BASE {
    return 'content_added_or_deleted'
  }

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
      { populate: ['user.notificationPreference'] },
    )

    // build determine filter functions
    const isEnabledFn = buildIsNotificationEnabled(this.getNotificationKey(), this.ctx)
    const filterFn = buildFilterByUserSettings({ ...this.ctx, config: this.config }, isEnabledFn)
    // fetch users with memberships, filter function should have extra param for it
    // this has to be bound to local
    // maybe remove from base template, maybe we do not need base template
    const filterUsers = pipe(
      // SpaceMembership[] -> User[]
      filterFn,
      filter((u: User) => u.id !== spaceEvent.user.id),
      uniqBy((user: User) => user.id),
    )
    return filterUsers(memberships)
  }

  async getTemplateContent(): Promise<NewContentTemplateInput['content']> {
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
    const action = SPACE_EVENT_ACTIVITY_TYPE[spaceEvent.activityType].split('_')[1]
    if (isNil(action)) {
      throw new errors.ValidationError(
        `Action code name ${SPACE_EVENT_ACTIVITY_TYPE[spaceEvent.activityType]} is not applicable`,
        { code: errors.ErrorCodes.EMAIL_VALIDATION },
      )
    }
    const objectType = SPACE_EVENT_OBJECT_TYPE[spaceEvent.objectType].toLowerCase()
    this.templateContent = {
      entityType: spaceEvent.entityType,
      action,
      objectType,
      user: {
        fullName: spaceEvent.user.unwrap().fullName,
      },
      space: {
        name: spaceEvent.space.unwrap().name,
        id: spaceEvent.space.id,
      },
    }
    return this.templateContent
  }

  async template(receiver: User): Promise<EmailSendInput> {
    /**
     * Content can be resolved independently by every handler
     * in case a) it can be dynamic - different for every receiver
     * in case b) it can be reused from class context -> determined in the contructor and then reused
     * consider calling the getTemplateContent() externally in email-process
     */
    const content = await this.getTemplateContent()
    const body = buildEmailTemplate<NewContentTemplateInput>(this.templateFile, {
      receiver,
      content,
    })
    return {
      emailType: EMAIL_TYPES.newContentAdded,
      to: receiver.email,
      body,
      subject: 'Content changed',
    }
  }
}
