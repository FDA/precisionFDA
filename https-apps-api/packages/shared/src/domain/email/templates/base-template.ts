import { difference, isNil } from 'ramda'
import { User } from '../..'
import { errors } from '../../..'
import { AnyObject, Maybe, OpsCtx } from '../../../types'
import { ajv } from '../../../utils/validator'
import { EmailNotification } from '../email-notification.entity'
import { EMAIL_TYPES, getEmailConfig, EmailConfigItem } from '../email.config'

export class EmailTemplate {
  emailType: EMAIL_TYPES
  config: EmailConfigItem
  ctx: OpsCtx

  constructor(emailTypeId: number, ctx: OpsCtx) {
    this.ctx = ctx
    this.config = getEmailConfig(emailTypeId)
    this.emailType = this.config.name
  }

  validate<T = AnyObject>(payload: T): T {
    const { schema } = this.config
    // run against validation schema, if applicable
    if (!schema) {
      // nothing to validate, payload should be also empty
      return payload
    }
    const validateFn = ajv.compile(schema)
    if (!validateFn(payload)) {
      const validationErrors = validateFn.errors
      throw new errors.ValidationError(`Email payload for email type ${this.emailType} invalid`, {
        code: errors.ErrorCodes.EMAIL_VALIDATION,
        validationErrors,
      })
    }

    return payload
  }

  isEnabled(notificationsConfig: Maybe<EmailNotification>): boolean {
    // for now, we know all default values are set to true
    const defaultValue = true
    if (isNil(notificationsConfig) || isNil(notificationsConfig.data)) {
      this.ctx.log.debug('Notifications object not found, applying default')
      return defaultValue
    }
    const settingValue: Maybe<boolean> = notificationsConfig.data[this.config.notificationKey]
    if (isNil(settingValue)) {
      this.ctx.log.debug(
        { emailNotificationsConfigId: notificationsConfig.id, key: this.config.notificationKey },
        'Notification key not found in user preferences, applying default',
      )
      return defaultValue
    }
    this.ctx.log.debug(
      {
        emailNotificationsConfigId: notificationsConfig.id,
        key: this.config.notificationKey,
        value: settingValue,
      },
      'Applying notification value found in the db',
    )
    return settingValue
  }

  // todo: maybe our flow can just accept list of recipients and send it in a bulk
  // depends how we want to plug in into app logic
  // todo: maybe this is too much -> leave in the business logic

  async getReceivers(receiverUserIds: number[]): Promise<User[]> {
    // find users
    const users = await this.ctx.em.getRepository(User).findWithEmailSettings(receiverUserIds)
    // check if all exist
    const nonExistingUserIds = difference(
      receiverUserIds,
      users.map(u => u.id),
    )
    if (nonExistingUserIds.length > 0) {
      throw new errors.NotFoundError(`User ids ${nonExistingUserIds.join(', ')} not found`, {
        code: errors.ErrorCodes.USER_NOT_FOUND,
      })
    }
    // filter by this.isEnabled
    return users.filter(user => {
      const emailTypeIsEnabled = this.isEnabled(user.emailNotificationSettings?.unwrap())
      if (!emailTypeIsEnabled) {
        this.ctx.log.info(
          { receiverId: user.id, emailType: this.emailType },
          'Skipping email type for user because of their config',
        )
      }
      return emailTypeIsEnabled
    })
  }

  template(payload: AnyObject) {
    // return subject, body of the email
  }
}
