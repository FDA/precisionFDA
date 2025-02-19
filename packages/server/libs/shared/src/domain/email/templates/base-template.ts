import { OpsCtx } from '@shared/types'
import { EMAIL_TYPES, getEmailConfig, EmailConfigItem } from '../email.config'

// used mostly for setting correct type of validated input
export class BaseTemplate<InputT, CtxT extends OpsCtx = OpsCtx> {
  emailType: EMAIL_TYPES
  config: EmailConfigItem
  ctx: CtxT
  validatedInput: InputT
  receiverUserIds: number[]

  constructor(emailTypeId: number, input: InputT, ctx: CtxT, receiverUserIds: number[] = []) {
    this.ctx = ctx
    this.config = getEmailConfig(emailTypeId)
    this.emailType = emailTypeId
    this.validatedInput = input
    this.ctx.log.log({ emailType: this.emailType }, 'Email template build')
    this.receiverUserIds = receiverUserIds
  }
}
