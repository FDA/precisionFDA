import { BaseOperation } from '../../../utils'
import { EmailProcessInput } from '../email.config'
import { BaseTemplate } from '../templates'
import { createSendEmailTask } from 'shared/src/queue'

export class EmailProcessOperation extends BaseOperation<EmailProcessInput, boolean> {
  async run(input: EmailProcessInput): Promise<boolean> {
    // fixme: we may need a specific email template based on email type?
    const emailTemplate = new BaseTemplate(input.emailTypeId, this.ctx)
    // fixme: prefs of the receiver (receivers), does not have to be logged-in user
    // const preferences = await this.ctx.em.findOne(EmailNotification, { user: this.ctx.user.id })
    // throws an error
    const templateInput = input.input
    emailTemplate.validate(templateInput)
    const receivers = await emailTemplate.getReceivers(input.receiverUserIds)
    console.log(
      receivers.map(user => user.id),
      'validated and allowed to send',
    )

    // NEXT: build different templates based on email type, transfer typings smartly
    const emailObjects = receivers.map(receiver => {
      const template = emailTemplate.template({ user: receiver }, templateInput)
      return template
    })
    await Promise.all(
      emailObjects.map(async emailObject => await createSendEmailTask(emailObject, this.ctx.user)),
    )

    // next step: build the data into a template
    // that's where the template will have to branch OR again it should be configurable via settings (which template to load for which email type)
    // the final result of this -> generate unique html for each receiver and push all the prepared emails into a queue
    // templates - very basic
    // then SENDING through the worker (or debug into file)
    // then CHECK with Pamella
    // then the templates etc

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
