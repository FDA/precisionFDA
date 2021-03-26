import { isNil } from 'ramda'
import { EmailSendInput, EmailTemplate, NewContentAdded } from '../../email.config'
import { User } from '../../..'
import { errors } from '../../../..'
import { SpaceEvent } from '../../../space-event'
import { newContentTemplate, NewContentTemplateInput } from '../mjml/new-content-template'
import { BaseTemplate } from '..'

export class SpaceNotificationEmailHandler
  extends BaseTemplate<NewContentAdded, NewContentTemplateInput>
  implements EmailTemplate {
  templateFile = newContentTemplate
  templateContent?: NewContentTemplateInput['content']

  async determineReceivers(): Promise<User[]> {
    // based on email type, find who will be the receiver
    // users who are in the space + active ?
    const testUsers = await this.ctx.em.find(User, { id: { $in: [2, 4] } })
    return testUsers
  }

  async getTemplateContent(): Promise<NewContentTemplateInput['content']> {
    // retrieve only once
    if (!isNil(this.templateContent)) {
      // does not really work now if .template() is called in parallel but maybe eventually
      return this.templateContent
    }
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
    const content = await this.getTemplateContent()
    const body = this.buildTemplateHtml({ receiver, content })
    return {
      to: receiver.email,
      body,
      subject: 'Added content',
    }
  }
}
