import { ErrorCodes, ValidationError } from '@shared/errors'
import { OpsCtx } from '../../../types'
import { ajv } from '../../../utils/validator'
import { EMAIL_TYPES, getEmailConfig, EmailConfigItem } from '../email.config'

// used mostly for validation and setting correct type of validated input
export class BaseTemplate<InputT, CtxT extends OpsCtx = OpsCtx> {
  emailType: EMAIL_TYPES
  config: EmailConfigItem
  ctx: CtxT
  validatedInput: InputT

  constructor(emailTypeId: number, input: unknown, ctx: CtxT) {
    this.ctx = ctx
    this.config = getEmailConfig(emailTypeId)
    this.emailType = emailTypeId
    this.ctx.log.log({ emailType: this.emailType }, 'Email template build')

    this.validatedInput = this.validate(input)
  }

  validate(payload: unknown): InputT {
    const { schema } = this.config
    // run against validation schema, if applicable
    if (!schema) {
      // nothing to validate, payload should be also empty
      return payload as InputT
    }
    const validateFn = ajv.compile(schema)
    if (!validateFn(payload)) {
      const validationErrors = validateFn.errors
      throw new ValidationError(`Email payload for email type ${this.config.name} invalid`, {
        code: ErrorCodes.EMAIL_VALIDATION,
        validationErrors,
      })
    }
    return (payload as any) as InputT
  }
}
