import { Injectable } from '@nestjs/common'
import { config } from '@shared/config'
import { EmailTypeToContextMap, LicenseApprovalContext } from '@shared/domain/email/dto/email-type-to-context.map'
import { EmailTypeToTemplateInputMap } from '@shared/domain/email/dto/email-type-to-template-input.map'
import { LicenseApprovalRequestDTO } from '@shared/domain/email/dto/license-approval-request.dto'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { EmailHandler } from '@shared/domain/email/templates/handlers/email.handler'
import { licenseApprovalRequestTemplate } from '@shared/domain/email/templates/mjml/license-approval-request.template'
import { LicenseRepository } from '@shared/domain/license/license.repository'
import { User } from '@shared/domain/user/user.entity'
import { UserRepository } from '@shared/domain/user/user.repository'
import { EmailClient } from '@shared/services/email-client'
import { lowercaseAndDash } from '@shared/utils/format'

@Injectable()
export class LicenseApprovalRequestHandler extends EmailHandler<EMAIL_TYPES.licenseApprovalRequest> {
  protected emailType = EMAIL_TYPES.licenseApprovalRequest as const
  protected inputDto = LicenseApprovalRequestDTO
  protected getBody = licenseApprovalRequestTemplate

  constructor(
    protected readonly licenseRepo: LicenseRepository,
    protected readonly userRepo: UserRepository,
    protected readonly emailClient: EmailClient,
  ) {
    super(emailClient)
  }

  protected async getContextualData(
    input: LicenseApprovalRequestDTO,
  ): Promise<EmailTypeToContextMap[EMAIL_TYPES.licenseApprovalRequest]> {
    const license = await this.licenseRepo.findOneOrFail(
      {
        id: input.license_id,
      },
      { populate: ['user'] },
    )
    const requester = await this.userRepo.findOneOrFail(
      {
        id: input.user_id,
      },
      { populate: ['organization'] },
    )
    const requesterName = `${requester.firstName} ${requester.lastName}`
    return {
      input,
      license,
      requester,
      requesterName,
    }
  }

  protected async determineReceivers(context: LicenseApprovalContext): Promise<User[]> {
    return [context.license.user.getEntity()]
  }

  protected getSubject(context: LicenseApprovalContext): string {
    return `${context.requesterName} requested approval for license: ${context.license.title}`
  }

  protected getTemplateInput(
    context: LicenseApprovalContext,
    receiver?: User,
  ): EmailTypeToTemplateInputMap[EMAIL_TYPES.licenseApprovalRequest] {
    return {
      userFullName: context.requesterName,
      userUsername: context.requester.dxuser,
      userOrgName: context.requester.organization.getEntity().name,
      licenseTitle: context.license.title,
      licenseUrl: `${config.api.railsHost}/licenses/${context.license.id}`,
      requestUrl: `${config.api.railsHost}/licenses/${context.license.id}-${lowercaseAndDash(context.license.title)}/users`,
      message: context.input.message,
      userId: receiver?.id,
    }
  }
}
