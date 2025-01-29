import {
  EMAIL_TYPES,
  EmailSendInput,
  EmailTemplate,
  NOTIFICATION_TYPES_BASE,
} from '@shared/domain/email/email.config'
import { UserOpsCtx } from '@shared/types'
import { BaseTemplate } from '@shared/domain/email/templates/base-template'
import { License } from '@shared/domain/license/license.entity'
import { User } from '@shared/domain/user/user.entity'
import {
  licenseApprovalRequestTemplate,
  LicenseApprovalTemplateInput,
} from '@shared/domain/email/templates/mjml/license-approval-request.template'
import { buildEmailTemplate } from '@shared/domain/email/email.helper'
import { LicenseApprovalRequestDto } from '@shared/domain/email/dto/license-approval-request.dto'
import { config } from '@shared/config'
import { lowercaseAndDash } from '@shared/utils/format'

export class LicenseApprovalRequestHandler
  extends BaseTemplate<LicenseApprovalRequestDto, UserOpsCtx>
  implements EmailTemplate<LicenseApprovalTemplateInput>
{
  templateFile = licenseApprovalRequestTemplate
  license: License
  requester: User

  async setupContext(): Promise<void> {
    this.license = await this.ctx.em.findOneOrFail(
      License,
      {
        id: this.validatedInput.license_id,
      },
      { populate: ['user'] },
    )
    this.requester = await this.ctx.em.findOneOrFail(
      User,
      {
        id: this.validatedInput.user_id,
      },
      { populate: ['organization'] },
    )
  }

  getNotificationKey(): keyof typeof NOTIFICATION_TYPES_BASE {
    return 'license_approval_request'
  }

  async determineReceivers(): Promise<User[]> {
    return [this.license.user.getEntity()]
  }

  async template(receiver: User): Promise<EmailSendInput> {
    const requesterName = `${this.requester.firstName} ${this.requester.lastName}`
    const body = buildEmailTemplate<LicenseApprovalTemplateInput>(this.templateFile, {
      userFullName: requesterName,
      userUsername: this.requester.dxuser,
      userOrgName: this.requester.organization.getEntity().name,
      licenseTitle: this.license.title,
      licenseUrl: `${config.api.railsHost}/licenses/${this.license.id}`,
      requestUrl: `${config.api.railsHost}/licenses/${this.license.id}-${lowercaseAndDash(this.license.title)}/users`,
      message: this.validatedInput.message,
      userId: receiver.id,
      receiver,
    })
    return {
      emailType: EMAIL_TYPES.licenseApprovalRequest,
      to: receiver.email,
      body,
      subject: `${requesterName} requested approval for license: ${this.license.title}`,
    }
  }
}
