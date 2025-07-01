import { Injectable } from '@nestjs/common'
import { AlertMessageInputDTO } from '@shared/domain/email/dto/alert-message-input.dto'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { EmailHandler } from '@shared/domain/email/templates/handlers/email.handler'
import { alertMessageTemplate } from '@shared/domain/email/templates/mjml/alert-message.template'
import { User } from '@shared/domain/user/user.entity'
import { EmailClient } from '@shared/services/email-client'
import { UserRepository } from '@shared/domain/user/user.repository'
import { EmailTypeToTemplateInputMap } from '@shared/domain/email/dto/email-type-to-template-input.map'
import { EmailTypeToContextMap } from '@shared/domain/email/dto/email-type-to-context.map'

@Injectable()
export class AlertMessageHandler extends EmailHandler<EMAIL_TYPES.alertMessage> {
  protected emailType = EMAIL_TYPES.alertMessage as const
  protected inputDto = AlertMessageInputDTO
  protected getBody = alertMessageTemplate

  constructor(
    protected readonly emailClient: EmailClient,
    protected readonly userRepo: UserRepository,
  ) {
    super(emailClient)
  }

  protected async determineReceivers(input: AlertMessageInputDTO): Promise<User[]> {
    return await this.userRepo.find({
      id: { $in: input.receiverUserIds },
    })
  }

  protected getSubject(_receiver: User, input: AlertMessageInputDTO): string {
    return input.subject
  }

  protected getTemplateInput(
    _receiver: User,
    input: AlertMessageInputDTO,
  ): EmailTypeToTemplateInputMap[EMAIL_TYPES.alertMessage] {
    return input
  }

  protected async getContextualData(
    input: AlertMessageInputDTO,
  ): Promise<EmailTypeToContextMap[EMAIL_TYPES.alertMessage]> {
    return input
  }
}
