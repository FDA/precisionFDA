import { EmailSendInput, EmailTemplate, NOTIFICATION_TYPES_BASE } from '../../email.config'
import { User } from '../../..'
import { JobFinishedInputTemplate, jobFinishedTemplate } from '../mjml/job-finished.template'
import { BaseTemplate } from '..'
import { buildEmailTemplate } from '../../email.helper'

// fixme:
type Foo = { jobId: number }

export class JobFinishedEmailHandler extends BaseTemplate<Foo> implements EmailTemplate {
  templateFile = jobFinishedTemplate

  getNotificationKey(): keyof typeof NOTIFICATION_TYPES_BASE {
    return 'job_finished'
  }

  async determineReceivers(): Promise<User[]> {
    const owner = await this.ctx.em.findOneOrFail(User, { id: this.ctx.user.id })
    // todo: check db settings
    return [owner]
  }

  async template(receiver: User): Promise<EmailSendInput> {
    // fixme: template content is same for everybody, wrong order of steps
    // can be called in a constructor or something...
    // const content = await this.getTemplateContent()
    const body = buildEmailTemplate<JobFinishedInputTemplate>(this.templateFile, {
      receiver,
      content: {},
    })
    return {
      to: receiver.email,
      body,
      subject: 'Job finished',
    }
  }
}
