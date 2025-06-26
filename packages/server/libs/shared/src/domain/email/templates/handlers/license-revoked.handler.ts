import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { licenseRevokedTemplate } from '@shared/domain/email/templates/mjml/license-revoked.template'
import { User } from '@shared/domain/user/user.entity'
import { config } from '@shared/config'
import { EmailHandler } from '@shared/domain/email/templates/handlers/email.handler'
import { Injectable } from '@nestjs/common'
import { EmailClient } from '@shared/services/email-client'
import { IdWithReceiversInputDTO } from '@shared/domain/email/dto/id-with-receivers-input.dto'
import { AcceptedLicenseRepository } from '@shared/domain/accepted-license/accepted-license.repository'
import { UserRepository } from '@shared/domain/user/user.repository'
import {
  EmailTypeToContextMap,
  LicenseRevokedContext,
} from '@shared/domain/email/dto/email-type-to-context.map'
import { EmailTypeToTemplateInputMap } from '@shared/domain/email/dto/email-type-to-template-input.map'

@Injectable()
export class LicenseRevokedHandler extends EmailHandler<EMAIL_TYPES.licenseRevoked> {
  protected emailType = EMAIL_TYPES.licenseRevoked as const
  protected inputDto = IdWithReceiversInputDTO
  protected getBody = licenseRevokedTemplate

  constructor(
    protected readonly acceptedLicenseRepo: AcceptedLicenseRepository,
    protected readonly userRepo: UserRepository,
    protected readonly emailClient: EmailClient,
  ) {
    super(emailClient)
  }

  protected async getContextualData(
    input: IdWithReceiversInputDTO,
  ): Promise<EmailTypeToContextMap[EMAIL_TYPES.licenseRevoked]> {
    const acceptedLicense = await this.acceptedLicenseRepo.findOneOrFail(
      {
        id: input.id,
      },
      { populate: ['license'] },
    )
    const license = acceptedLicense.license.getEntity()
    return {
      input,
      acceptedLicense,
      license,
    }
  }

  protected async determineReceivers(context: LicenseRevokedContext): Promise<User[]> {
    const receiver = await this.userRepo.findOneOrFail({
      id: context.input.receiverUserIds[0],
    })
    return [receiver]
  }

  protected getSubject(_receiver: User, context: LicenseRevokedContext): string {
    return `Your license for ${context.license.title} has been revoked`
  }

  protected getTemplateInput(
    receiver: User,
    context: LicenseRevokedContext,
  ): EmailTypeToTemplateInputMap[EMAIL_TYPES.licenseRevoked] {
    return {
      firstName: receiver.firstName,
      lastName: receiver.lastName,
      licenseTitle: context.license.title,
      licenseUrl: `${config.api.railsHost}/licenses/${context.acceptedLicense.license.id}`,
      receiver,
    }
  }
}
