import { BaseOperation } from '../../../utils'
import { EmailProcessInput, getEmailConfig, EmailTemplate } from '../email.config'
import { createSendEmailTask } from '../../../queue'
import { UserOpsCtx } from '../../../types'
import { DNANEXUS_INVALID_EMAIL } from '../../../config/consts'

export class EmailProcessOperation extends BaseOperation<UserOpsCtx, EmailProcessInput, boolean> {
  input: EmailProcessInput

  async run(input: EmailProcessInput): Promise<boolean> {
    this.input = input
    const emailTemplate = await this.getEmailTemplate()
    const receivers = await emailTemplate.determineReceivers()
    const activeReceivers = receivers.filter(user => !user.email.includes(DNANEXUS_INVALID_EMAIL))
    const emailObjects = await Promise.all(
      activeReceivers.map(async receiver => {
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
   * @returns instance of class that implements EmailTemplate
   */
  private async getEmailTemplate(): Promise<EmailTemplate> {
    const emailTypeId = this.input.emailTypeId
    const emailConfig = getEmailConfig(emailTypeId)
    const handler = emailConfig.handlerClass
    // this also runs input validation
    const instance = new handler(emailTypeId, this.input.input, this.ctx)
    await instance.setupContext()
    return instance
  }
}
