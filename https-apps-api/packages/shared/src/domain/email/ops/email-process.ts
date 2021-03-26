import { BaseOperation } from '../../../utils'
import { EmailProcessInput, getEmailConfig, EmailTemplate } from '../email.config'
import { createSendEmailTask } from '../../../queue'

export class EmailProcessOperation extends BaseOperation<EmailProcessInput, boolean> {
  input: EmailProcessInput

  async run(input: EmailProcessInput): Promise<boolean> {
    this.input = input
    const emailTemplate = this.getEmailTemplate()
    const receivers = await emailTemplate.determineReceivers()
    console.log(
      receivers.map(user => user.id),
      'validated and allowed to send',
    )

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
  private getEmailTemplate(): EmailTemplate {
    const emailTypeId = this.input.emailTypeId
    const emailConfig = getEmailConfig(emailTypeId)
    const template = emailConfig.templateClass
    // this also runs input validation
    return new template(emailTypeId, this.input.input, this.ctx)
  }
}
