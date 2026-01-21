import { Injectable } from '@nestjs/common'
import { config } from '@shared/config'
import {
  EmailTypeToContextMap,
  InvitationContext,
} from '@shared/domain/email/dto/email-type-to-context.map'
import { EmailTypeToTemplateInputMap } from '@shared/domain/email/dto/email-type-to-template-input.map'
import { ObjectIdInputDTO } from '@shared/domain/email/dto/object-id.dto'
import { EmailAddress } from '@shared/domain/email/model/email-address'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { EmailHandler } from '@shared/domain/email/templates/handlers/email.handler'
import { invitationTemplate } from '@shared/domain/email/templates/mjml/invitation.template'
import { InvitationRepository } from '@shared/domain/invitation/invitation.repository'
import { EmailClient } from '@shared/services/email-client'

@Injectable()
export class InvitationHandler extends EmailHandler<EMAIL_TYPES.invitation> {
  protected emailType = EMAIL_TYPES.invitation as const
  protected inputDto = ObjectIdInputDTO
  protected getBody = invitationTemplate

  constructor(
    protected readonly invitationRepo: InvitationRepository,
    protected readonly emailClient: EmailClient,
  ) {
    super(emailClient)
  }

  protected async getContextualData(
    input: ObjectIdInputDTO,
  ): Promise<EmailTypeToContextMap[EMAIL_TYPES.invitation]> {
    const invitation = await this.invitationRepo.findOneOrFail({
      id: input.id,
    })
    return {
      invitation,
      input,
    }
  }

  protected async determineReceivers(): Promise<EmailAddress[]> {
    return [config.pfdaEmail]
  }

  protected getSubject(context: InvitationContext): string {
    return `New access request from ${context.invitation.firstName} ${context.invitation.lastName}`
  }

  protected getTemplateInput(
    context: InvitationContext,
  ): EmailTypeToTemplateInputMap[EMAIL_TYPES.invitation] {
    return {
      firstName: context.invitation.firstName,
      lastName: context.invitation.lastName,
      email: context.invitation.email,
      address1: context.invitation.address1,
      address2: context.invitation.address2,
      phone: context.invitation.phone,
      duns: context.invitation.duns,
      reqReason: context.invitation.extras.req_reason,
      reqData: context.invitation.extras.req_data,
      reqSoftware: context.invitation.extras.req_software,
      researchIntent: context.invitation.extras.research_intent,
      clinicalIntent: context.invitation.extras.clinical_intent,
      participateIntent: context.invitation.extras.participate_intent,
      organizeIntent: context.invitation.extras.organize_intent,
      ip: context.invitation.ip,
    }
  }
}
