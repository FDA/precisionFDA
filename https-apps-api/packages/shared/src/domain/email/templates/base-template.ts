import { errors } from '../../..'
import { OpsCtx } from '../../../types'
import { ajv } from '../../../utils/validator'
import { EMAIL_TYPES, getEmailConfig, EmailConfigItem } from '../email.config'

// used mostly for validation and setting correct type of validated input
export class BaseTemplate<T> {
  emailType: EMAIL_TYPES
  config: EmailConfigItem
  ctx: OpsCtx
  validatedInput: T

  constructor(emailTypeId: number, input: unknown, ctx: OpsCtx) {
    this.ctx = ctx
    this.config = getEmailConfig(emailTypeId)
    this.emailType = this.config.name
    this.ctx.log.info({ emailType: this.emailType }, 'Email template build')

    this.validatedInput = this.validate(input)
  }

  validate(payload: unknown): T {
    const { schema } = this.config
    // run against validation schema, if applicable
    if (!schema) {
      // nothing to validate, payload should be also empty
      return payload as T
    }
    const validateFn = ajv.compile(schema)
    if (!validateFn(payload)) {
      const validationErrors = validateFn.errors
      throw new errors.ValidationError(`Email payload for email type ${this.emailType} invalid`, {
        code: errors.ErrorCodes.EMAIL_VALIDATION,
        validationErrors,
      })
    }
    return (payload as any) as T
  }
}
