import { licenseRequestApprovedTemplate } from '@shared/domain/email/templates/mjml/license-approved.template'
import { User } from '@shared/domain/user/user.entity'
import { config } from '@shared/config'
import { lowercaseAndDash } from '@shared/utils/format'
import { Injectable } from '@nestjs/common'
import { EmailHandler } from '@shared/domain/email/templates/handlers/email.handler'
import { EmailClient } from '@shared/services/email-client'
import { IdWithReceiversInputDTO } from '@shared/domain/email/dto/id-with-receivers-input.dto'
import { AcceptedLicenseRepository } from '@shared/domain/accepted-license/accepted-license.repository'
import { UserRepository } from '@shared/domain/user/user.repository'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import {
  EmailTypeToContextMap,
  LicenseApprovedContext,
} from '@shared/domain/email/dto/email-type-to-context.map'
import { EmailTypeToTemplateInputMap } from '@shared/domain/email/dto/email-type-to-template-input.map'

@Injectable()
export class LicenseApprovedHandler extends EmailHandler<EMAIL_TYPES.licenseApproved> {
  protected emailType = EMAIL_TYPES.licenseApproved as const
  protected inputDto = IdWithReceiversInputDTO
  protected getBody = licenseRequestApprovedTemplate

  constructor(
    protected readonly licenseAcceptedRepo: AcceptedLicenseRepository,
    protected readonly userRepo: UserRepository,
    protected readonly emailClient: EmailClient,
  ) {
    super(emailClient)
  }

  protected async getContextualData(
    input: IdWithReceiversInputDTO,
  ): Promise<EmailTypeToContextMap[EMAIL_TYPES.licenseApproved]> {
    const acceptedLicense = await this.licenseAcceptedRepo.findOneOrFail(
      {
        id: input.id,
      },
      { populate: ['license'] },
    )
    return { input, acceptedLicense }
  }

  protected async determineReceivers(context: LicenseApprovedContext): Promise<User[]> {
    const receiver = await this.userRepo.findOneOrFail({
      id: context.input.receiverUserIds[0],
    })
    return [receiver]
  }

  protected getSubject(_receiver: User, context: LicenseApprovedContext): string {
    return `You were approved for ${context.acceptedLicense.license.getEntity().title}`
  }

  protected getTemplateInput(
    receiver: User,
    context: LicenseApprovedContext,
  ): EmailTypeToTemplateInputMap[EMAIL_TYPES.licenseApproved] {
    const license = context.acceptedLicense.license.getEntity()
    return {
      firstName: receiver.firstName,
      lastName: receiver.lastName,
      licenseTitle: license.title,
      licenseUrl: `${config.api.railsHost}/licenses/${license.id}`,
      itemsLicenseUrl: `${config.api.railsHost}/licenses/${license.id}-${lowercaseAndDash(license.title)}/items`,
      receiver,
    }
  }
}
