import { BaseOperation } from '../../../utils'
import { EmailSendInput } from '../email.config'
import { BaseTemplate } from '../templates'

// todo: use the existing table, somehow port the keys

export class EmailProcessOperation extends BaseOperation<EmailSendInput, boolean> {
  async run(input: EmailSendInput): Promise<boolean> {
    // fixme: we may need a specific email template based on email type?
    const emailTemplate = new BaseTemplate(input.emailTypeId, this.ctx)
    // fixme: prefs of the receiver (receivers), does not have to be logged-in user
    // const preferences = await this.ctx.em.findOne(EmailNotification, { user: this.ctx.user.id })
    // throws an error
    emailTemplate.validate(input.input)
    const receivers = await emailTemplate.getReceivers(input.receiverUserIds)
    // console.log(receivers, 'validated and allowed to send')
    // determine email type
    // validate input for this email
    // determine receivers (can be logged-in user or someone else)
    // filter -> do they want to receive
    // build email content -> templates, headers
    // send the email -> depending on the environment
    // put the task in the queue?
    return true
  }
}
