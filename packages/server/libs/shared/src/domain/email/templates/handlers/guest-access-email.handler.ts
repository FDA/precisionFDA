import { BaseTemplate } from '@shared/domain/email/templates/base-template'
import { buildEmailTemplate, ObjectIdInputDTO } from '@shared/domain/email/email.helper'
import { UserOpsCtx } from '@shared/types'
import { EmptyEmailInputDTO } from '@shared/domain/email/dto/empty-email-input.dto'
import {
  EMAIL_TYPES,
  EmailSendInput,
  EmailTemplate,
  NOTIFICATION_TYPES_BASE,
} from '@shared/domain/email/email.config'
import {
  guestAccessTemplate,
  GuestAccessTemplateInput,
} from '@shared/domain/email/templates/mjml/guest-access-email.template'
import { User } from '@shared/domain/user/user.entity'
import { Invitation } from '@shared/domain/invitation/invitation.entity'
import { config } from '@shared/config'

export class GuestAccessEmailHandler
  extends BaseTemplate<ObjectIdInputDTO, UserOpsCtx>
  implements EmailTemplate<EmptyEmailInputDTO>
{
  templateFile = guestAccessTemplate
  invitation: Invitation

  async setupContext(): Promise<void> {
    this.invitation = await this.ctx.em.findOneOrFail(
      Invitation,
      {
        id: this.validatedInput.id,
      },
      { populate: ['user'] },
    )
  }

  async determineReceivers(): Promise<User[]> {
    return [{ email: this.invitation.email } as User]
  }

  async template(receiver: User): Promise<EmailSendInput> {
    const body = buildEmailTemplate<GuestAccessTemplateInput>(this.templateFile, {
      firstName: this.invitation.firstName,
      lastName: this.invitation.lastName,
      receiver,
    })
    return {
      emailType: EMAIL_TYPES.guestAccessEmail,
      to: receiver.email,
      bcc: config.pfdaEmail,
      body,
      subject: 'Your precisionFDA access request',
    }
  }

  getNotificationKey(): keyof typeof NOTIFICATION_TYPES_BASE {
    return 'guest_access_email'
  }
}
