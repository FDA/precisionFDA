import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { User } from '@shared/domain/user/user.entity'
import { userProvisionedTemplate } from '@shared/domain/email/templates/mjml/user-provisioned.template'
import { UserProvisionedDTO } from '@shared/domain/email/dto/user-provisioned.dto'
import { Injectable } from '@nestjs/common'
import { EmailHandler } from '@shared/domain/email/templates/handlers/email.handler'
import { EmailClient } from '@shared/services/email-client'
import { EmailTypeToTemplateInputMap } from '@shared/domain/email/dto/email-type-to-template-input.map'
import { EmailTypeToContextMap } from '@shared/domain/email/dto/email-type-to-context.map'

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

  protected async determineReceivers(input: UserProvisionedDTO): Promise<User[]> {
    return [{ email: input.email } as User]
  }

  protected getSubject(_receiver: User, input: UserProvisionedDTO): string {
    return `Welcome to precisionFDA, ${input.firstName}!`
  }

  protected getTemplateInput(
    _receiver: User,
    input: UserProvisionedDTO,
  ): EmailTypeToTemplateInputMap[EMAIL_TYPES.userProvisioned] {
    return {
      firstName: input.firstName,
      username: input.username,
      email: _receiver.email,
    }
  }

  protected async getContextualData(
    input: UserProvisionedDTO,
  ): Promise<EmailTypeToContextMap[EMAIL_TYPES.userProvisioned]> {
    return input
  }
}
