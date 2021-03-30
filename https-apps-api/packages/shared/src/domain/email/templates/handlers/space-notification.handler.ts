import { filter, map, pipe, uniqBy, isNil } from 'ramda'
import { EmailSendInput, EmailTemplate, NewContentAdded } from '../../email.config'
import { SpaceMembership, User } from '../../..'
import { errors } from '../../../..'
import { SpaceEvent } from '../../../space-event'
import { newContentTemplate, NewContentTemplateInput } from '../mjml/new-content.template'
import { BaseTemplate } from '..'

export class SpaceNotificationEmailHandler
  extends BaseTemplate<NewContentAdded, NewContentTemplateInput>
  implements EmailTemplate {
  templateFile = newContentTemplate
  templateContent?: NewContentTemplateInput['content']

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
      uniqBy((user: User) => user.id),
      scopedFn,
    )
    const result = filterUsers(memberships)
    // based on email type, find who will be the receiver
    // users who are in the space + active ?
    return result
  }

  async getTemplateContent(): Promise<NewContentTemplateInput['content']> {
    // if (!isNil(this.templateContent)) {
    //   console.log('returning content from "cache"')
    //   // does not really work now if .template() is called in parallel but maybe eventually
    //   return this.templateContent
    // }
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
    this.templateContent = {
      entityType: spaceEvent.entityType,
      user: {
        firstName: spaceEvent.user.unwrap().firstName,
        lastName: spaceEvent.user.unwrap().lastName,
      },
      space: {
        name: spaceEvent.space.unwrap().name,
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
    const body = this.buildTemplateHtml({ receiver, content })
    return {
      to: receiver.email,
      body,
      subject: 'Added content',
    }
  }
}
