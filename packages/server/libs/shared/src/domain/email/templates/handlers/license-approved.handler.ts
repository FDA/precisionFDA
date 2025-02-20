import { buildEmailTemplate, ObjectIdInputDTO } from '@shared/domain/email/email.helper'
import { UserOpsCtx } from '@shared/types'
import {
  EMAIL_TYPES,
  EmailSendInput,
  EmailTemplate,
  NOTIFICATION_TYPES_BASE,
} from '@shared/domain/email/email.config'
import { BaseTemplate } from '@shared/domain/email/templates/base-template'
import {
  licenseRequestApprovedTemplate,
  LicenseRequestApprovedTemplateInput,
} from '@shared/domain/email/templates/mjml/license-approved.template'
import { User } from '@shared/domain/user/user.entity'
import { AcceptedLicense } from '@shared/domain/accepted-license/accepted-license.entity'
import { config } from '@shared/config'
import { lowercaseAndDash } from '@shared/utils/format'

export class LicenseApprovedHandler
  extends BaseTemplate<ObjectIdInputDTO, UserOpsCtx>
  implements EmailTemplate<LicenseRequestApprovedTemplateInput>
{
  templateFile = licenseRequestApprovedTemplate
  acceptedLicense: AcceptedLicense

  async setupContext(): Promise<void> {
    this.acceptedLicense = await this.ctx.em.findOneOrFail(
      AcceptedLicense,
      {
        id: this.validatedInput.id,
      },
      { populate: ['license'] },
    )
  }

  async determineReceivers(): Promise<User[]> {
    const receiver = await this.ctx.em.findOneOrFail(User, {
      id: this.receiverUserIds[0],
    })
    return [receiver]
  }

  async template(receiver: User): Promise<EmailSendInput> {
    const license = this.acceptedLicense.license.getEntity()
    const body = buildEmailTemplate<LicenseRequestApprovedTemplateInput>(this.templateFile, {
      firstName: receiver.firstName,
      lastName: receiver.lastName,
      licenseTitle: license.title,
      licenseUrl: `${config.api.railsHost}/licenses/${license.id}`,
      itemsLicenseUrl: `${config.api.railsHost}/licenses/${license.id}-${lowercaseAndDash(license.title)}/items`,
      receiver,
    })
    return {
      emailType: EMAIL_TYPES.licenseApproved,
      to: receiver.email,
      body,
      subject: `You were approved for ${this.acceptedLicense.license.getEntity().title}`,
    }
  }

  getNotificationKey(): keyof typeof NOTIFICATION_TYPES_BASE {
    return 'license_approved'
  }
}
