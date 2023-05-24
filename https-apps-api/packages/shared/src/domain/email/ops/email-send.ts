import { WorkerBaseOperation } from '../../../utils/base-operation'
import type { SendEmailJob } from '../../../queue/task.input'
import { getBullJobIdForEmailOperation } from '../email.helper'
import { EMAIL_TYPES } from '../email.config'
import { OpsCtx } from '../../../types'
import { getServiceFactory } from '../../../services/service-factory'

export class EmailSendOperation extends WorkerBaseOperation<
  OpsCtx,
  SendEmailJob['payload'],
  boolean
> {
  static getBullJobId = (emailType: EMAIL_TYPES, customSuffix?: string): string => {
    return getBullJobIdForEmailOperation(emailType, customSuffix)
  }

  async run(input: SendEmailJob['payload']): Promise<boolean> {
    const emailService = getServiceFactory().getEmailService()
    try {
      await emailService.sendEmail(input)
      return true
    } catch (err) {
      this.ctx.log.error({ err }, 'AWS SES client failed')
      throw err
    }
  }
}
