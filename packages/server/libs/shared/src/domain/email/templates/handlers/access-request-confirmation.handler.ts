import { Injectable } from '@nestjs/common'
import { EmailTypeToContextMap, InvitationContext } from '@shared/domain/email/dto/email-type-to-context.map'
import { EmailTypeToTemplateInputMap } from '@shared/domain/email/dto/email-type-to-template-input.map'
import { ObjectIdInputDTO } from '@shared/domain/email/dto/object-id.dto'
import { EmailAddress } from '@shared/domain/email/model/email-address'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { EmailHandler } from '@shared/domain/email/templates/handlers/email.handler'
import { accessRequestConfirmationTemplate } from '@shared/domain/email/templates/mjml/access-request-confirmation.template'
import { InvitationRepository } from '@shared/domain/invitation/invitation.repository'
import { EmailClient } from '@shared/services/email-client'

@Injectable()
export class AccessRequestConfirmationHandler extends EmailHandler<EMAIL_TYPES.accessRequestConfirmation> {
  protected emailType = EMAIL_TYPES.accessRequestConfirmation as const
  protected inputDto = ObjectIdInputDTO
  protected getBody = accessRequestConfirmationTemplate

  constructor(
    protected readonly invitationRepo: InvitationRepository,
    protected readonly emailClient: EmailClient,
  ) {
    super(emailClient)
  }

  protected async getContextualData(
    input: ObjectIdInputDTO,
  ): Promise<EmailTypeToContextMap[EMAIL_TYPES.accessRequestConfirmation]> {
    const invitation = await this.invitationRepo.findOneOrFail({
      id: input.id,
    })
    return { invitation, input }
  }

  protected async determineReceivers(context: InvitationContext): Promise<EmailAddress[]> {
    return [context.invitation.email as EmailAddress]
  }

  protected getSubject(): string {
    return 'Your precisionFDA access request'
  }

  protected getTemplateInput(
    context: InvitationContext,
  ): EmailTypeToTemplateInputMap[EMAIL_TYPES.accessRequestConfirmation] {
    return {
      firstName: context.invitation.firstName,
      lastName: context.invitation.lastName,
    }
  }
}
