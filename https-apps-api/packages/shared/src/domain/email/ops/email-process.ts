import { BaseOperation } from '../../../utils'
import { EmailProcessInput, getEmailConfig, EmailTemplate } from '../email.config'
import { createSendEmailTask } from '../../../queue'

export class EmailProcessOperation extends BaseOperation<EmailProcessInput, boolean> {
  input: EmailProcessInput

  async run(input: EmailProcessInput): Promise<boolean> {
    this.input = input
    const emailTemplate = await this.getEmailTemplate()
    const receivers = await emailTemplate.determineReceivers()
    const emailObjects = await Promise.all(
      receivers.map(async receiver => {
        const template = await emailTemplate.template(receiver)
        return template
      }),
    )
    await Promise.all(
      emailObjects.map(async emailObject => await createSendEmailTask(emailObject, this.ctx.user)),
    )
    return true
  }

  /**
   * @returns class that implements EmailTemplate
   */
  private async getEmailTemplate(): Promise<EmailTemplate> {
    const emailTypeId = this.input.emailTypeId
    const emailConfig = getEmailConfig(emailTypeId)
    const template = emailConfig.templateClass
    // this also runs input validation
    const instance = new template(emailTypeId, this.input.input, this.ctx)
    await instance.setupContext()
    return instance
  }
}
