import { buildEmailTemplate, ObjectIdInputDto } from '@shared/domain/email/email.helper'
import { UserOpsCtx } from '@shared/types'
import {
  EMAIL_TYPES,
  EmailSendInput,
  EmailTemplate,
  NOTIFICATION_TYPES_BASE,
} from '@shared/domain/email/email.config'
import { BaseTemplate } from '@shared/domain/email/templates/base-template'
import {
  invitationTemplate,
  InvitationTemplateInput,
} from '@shared/domain/email/templates/mjml/invitation.template'
import { Invitation } from '@shared/domain/invitation/invitation.entity'
import { User } from '@shared/domain/user/user.entity'
import { config } from '@shared/config'

export class InvitationHandler
  extends BaseTemplate<ObjectIdInputDto, UserOpsCtx>
  implements EmailTemplate<InvitationTemplateInput>
{
  templateFile = invitationTemplate
  invitation: Invitation

  async setupContext(): Promise<void> {
    this.invitation = await this.ctx.em.findOneOrFail(Invitation, {
      id: this.validatedInput.id,
    })
  }

  getNotificationKey(): keyof typeof NOTIFICATION_TYPES_BASE {
    return 'invitation'
  }

  async determineReceivers(): Promise<User[]> {
    const recipients = [{ email: config.supportEmail } as User]
    if (config.env === 'production') {
      recipients.push({ email: config.pfdaEmail } as User)
    }
    return recipients
  }

  async template(receiver: User): Promise<EmailSendInput> {
    const body = buildEmailTemplate<InvitationTemplateInput>(this.templateFile, {
      firstName: this.invitation.firstName,
      lastName: this.invitation.lastName,
      email: this.invitation.email,
      address1: this.invitation.address1,
      address2: this.invitation.address2,
      phone: this.invitation.phone,
      duns: this.invitation.duns,
      reqReason: this.invitation.extras.req_reason,
      reqData: this.invitation.extras.req_data,
      reqSoftware: this.invitation.extras.req_software,
      researchIntent: this.invitation.extras.research_intent,
      clinicalIntent: this.invitation.extras.clinical_intent,
      participateIntent: this.invitation.extras.participate_intent,
      organizeIntent: this.invitation.extras.organize_intent,
      ip: this.invitation.ip,
      receiver,
    })
    return {
      emailType: EMAIL_TYPES.invitation,
      to: receiver.email,
      replyTo: config.supportEmail,
      body,
      subject: `New access request from ${receiver.firstName} ${receiver.lastName}`,
    }
  }
}
