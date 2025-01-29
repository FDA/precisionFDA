import { BaseTemplate } from '@shared/domain/email/templates/base-template'
import { UserOpsCtx } from '@shared/types'
import {
  EMAIL_TYPES,
  EmailSendInput,
  EmailTemplate,
  NOTIFICATION_TYPES_BASE,
} from '@shared/domain/email/email.config'
import { alertMessageTemplate } from '@shared/domain/email/templates/mjml/alert-message.template'
import { User } from '@shared/domain/user/user.entity'
import { buildEmailTemplate } from '@shared/domain/email/email.helper'
import { AlertMessageInputDto } from '@shared/domain/email/dto/alert-message-input.dto'

export class AlertMessageHandler
  extends BaseTemplate<AlertMessageInputDto, UserOpsCtx>
  implements EmailTemplate<AlertMessageInputDto>
{
  templateFile = alertMessageTemplate
  alertMessageInput: AlertMessageInputDto = this.validatedInput

  getNotificationKey(): keyof typeof NOTIFICATION_TYPES_BASE {
    return 'alert_message'
  }

  async setupContext(): Promise<void> {}

  async determineReceivers(): Promise<User[]> {
    return await this.ctx.em.find(User, {
      id: { $in: this.receiverUserIds },
    })
  }

  async template(receiver: User): Promise<EmailSendInput> {
    const body = buildEmailTemplate<AlertMessageInputDto>(this.templateFile, this.alertMessageInput)
    return {
      emailType: EMAIL_TYPES.alertMessage,
      to: receiver.email,
      body,
      subject: this.alertMessageInput.subject,
    }
  }
}
