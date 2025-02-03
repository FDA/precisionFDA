import { BaseTemplate } from '@shared/domain/email/templates/base-template'
import {
  EmailSendInput,
  EmailTemplate,
  EMAIL_TYPES,
  NOTIFICATION_TYPES_BASE,
} from '@shared/domain/email/email.config'
import { UserOpsCtx } from '@shared/types'
import { User } from '@shared/domain/user/user.entity'
import { buildEmailTemplate } from '@shared/domain/email/email.helper'
import {
  UserProvisionedInput,
  userProvisionedTemplate,
} from '@shared/domain/email/templates/mjml/user-provisioned.template'
import { UserProvisionedDto } from '@shared/domain/email/dto/user-provisioned.dto'

/**
 * Handles the email notification for user provisioning (currently
 * it should be only government users), because regular users
 * receive emails from platform.
 */
export class UserProvisionedHandler
  extends BaseTemplate<UserProvisionedDto, UserOpsCtx>
  implements EmailTemplate<UserProvisionedInput>
{
  templateFile = userProvisionedTemplate

  getNotificationKey(): keyof typeof NOTIFICATION_TYPES_BASE {
    return 'user_provisioned'
  }

  async setupContext(): Promise<void> {}

  async determineReceivers(): Promise<User[]> {
    return [{ email: this.validatedInput.email } as User]
  }

  async template(receiver: User): Promise<EmailSendInput> {
    const subject = `Welcome to precisionFDA, ${this.validatedInput.firstName}!`
    const body = buildEmailTemplate<UserProvisionedInput>(this.templateFile, {
      firstName: this.validatedInput.firstName,
      username: this.validatedInput.username,
      email: receiver.email,
      receiver,
    })

    return {
      emailType: EMAIL_TYPES.userProvisioned,
      to: receiver.email,
      body,
      subject,
    }
  }
}
