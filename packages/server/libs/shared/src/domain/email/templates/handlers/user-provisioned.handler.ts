import { Injectable } from '@nestjs/common'
import { EmailTypeToContextMap } from '@shared/domain/email/dto/email-type-to-context.map'
import { EmailTypeToTemplateInputMap } from '@shared/domain/email/dto/email-type-to-template-input.map'
import { UserProvisionedDTO } from '@shared/domain/email/dto/user-provisioned.dto'
import { EmailAddress } from '@shared/domain/email/model/email-address'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { EmailHandler } from '@shared/domain/email/templates/handlers/email.handler'
import { userProvisionedTemplate } from '@shared/domain/email/templates/mjml/user-provisioned.template'
import { EmailClient } from '@shared/services/email-client'

/**
 * Handles the email notification for user provisioning (currently
 * it should be only government users), because regular users
 * receive emails from platform.
 */
@Injectable()
export class UserProvisionedHandler extends EmailHandler<EMAIL_TYPES.userProvisioned> {
  protected emailType = EMAIL_TYPES.userProvisioned as const
  protected inputDto = UserProvisionedDTO
  protected getBody = userProvisionedTemplate

  constructor(protected readonly emailClient: EmailClient) {
    super(emailClient)
  }

  protected async determineReceivers(input: UserProvisionedDTO): Promise<EmailAddress[]> {
    return [input.email]
  }

  protected getSubject(input: UserProvisionedDTO): string {
    return `Welcome to precisionFDA, ${input.firstName}!`
  }

  protected getTemplateInput(
    input: UserProvisionedDTO,
  ): EmailTypeToTemplateInputMap[EMAIL_TYPES.userProvisioned] {
    return {
      firstName: input.firstName,
      username: input.username,
      email: input.email,
    }
  }

  protected async getContextualData(
    input: UserProvisionedDTO,
  ): Promise<EmailTypeToContextMap[EMAIL_TYPES.userProvisioned]> {
    return input
  }
}
