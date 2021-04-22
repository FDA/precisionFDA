import { EmailSendInput, EmailTemplate, NOTIFICATION_TYPES_BASE } from '../../email.config'
import { User } from '../../..'
import { JobFinishedInputTemplate, jobFinishedTemplate } from '../mjml/job-finished.template'
import { BaseTemplate } from '..'
import { buildEmailTemplate } from '../../email.helper'

type JobFinishedInputType = { jobId: number }

export class JobFinishedEmailHandler
  extends BaseTemplate<JobFinishedInputType>
  implements EmailTemplate {
  templateFile = jobFinishedTemplate

  async setupContext(): Promise<void> {}

  getNotificationKey(): keyof typeof NOTIFICATION_TYPES_BASE {
    return 'job_finished'
  }

  async determineReceivers(): Promise<User[]> {
    const owner = await this.ctx.em.findOneOrFail(User, { id: this.ctx.user.id })
    // todo: if this run in a space, more people than the owner should be notified?
    // todo: check db settings
    return [owner]
  }

  async template(receiver: User): Promise<EmailSendInput> {
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
