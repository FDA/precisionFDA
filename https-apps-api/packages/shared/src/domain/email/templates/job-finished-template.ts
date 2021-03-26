import { EmailSendInput, EmailTemplate } from '../email.config'
import { User } from '../..'
import { JobFinishedInputTemplate, jobFinishedTemplate } from './mjml/job-finished-template'
import { BaseTemplate } from '.'

// fixme:
type Foo = { jobId: number }

export class JobFinishedEmailTemplate
  extends BaseTemplate<Foo, JobFinishedInputTemplate>
  implements EmailTemplate {
  templateFile = jobFinishedTemplate

  async determineReceivers(): Promise<User[]> {
    return []
  }

  async template(receiver: User): Promise<EmailSendInput> {
    // fixme: template content is same for everybody, wrong order of steps
    // can be called in a constructor or something...
    // const content = await this.getTemplateContent()
    const body = this.buildTemplateHtml({ receiver, content: {} })
    return {
      to: receiver.email,
      body,
      subject: 'Job finished',
    }
  }
}
