import { BaseTemplate } from '@shared/domain/email/templates/base-template'
import { buildEmailTemplate, ObjectIdInputDto } from '@shared/domain/email/email.helper'
import { UserOpsCtx } from '@shared/types'
import {
  EMAIL_TYPES,
  EmailSendInput,
  EmailTemplate,
  NOTIFICATION_TYPES_BASE,
} from '@shared/domain/email/email.config'
import {
  licenseRevokedTemplate,
  LicenseRevokedTemplateInput,
} from '@shared/domain/email/templates/mjml/license-revoked.template'
import { User } from '@shared/domain/user/user.entity'
import { AcceptedLicense } from '@shared/domain/accepted-license/accepted-license.entity'
import { config } from '@shared/config'

export class LicenseRevokedHandler
  extends BaseTemplate<ObjectIdInputDto, UserOpsCtx>
  implements EmailTemplate<LicenseRevokedTemplateInput>
{
  templateFile = licenseRevokedTemplate
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

  getNotificationKey(): keyof typeof NOTIFICATION_TYPES_BASE {
    return 'license_revoked'
  }

  async template(receiver: User): Promise<EmailSendInput> {
    const license = this.acceptedLicense.license.getEntity()
    const body = buildEmailTemplate<LicenseRevokedTemplateInput>(this.templateFile, {
      firstName: receiver.firstName,
      lastName: receiver.lastName,
      licenseTitle: license.title,
      licenseUrl: `${config.api.railsHost}/licenses/${this.acceptedLicense.license.id}`,
      receiver,
    })
    return {
      emailType: EMAIL_TYPES.licenseRevoked,
      to: receiver.email,
      body,
      subject: `Your license for ${license.title} has been revoked`,
    }
  }
}
