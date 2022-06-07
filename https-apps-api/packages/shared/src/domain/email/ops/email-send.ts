import { WorkerBaseOperation } from '../../../utils/base-operation'
import type { SendEmailJob } from '../../../queue/task.input'
import * as helper from '../email.helper'
import { config } from '../../../config'
import { emailClient } from '../../../services/salesforce.service'
import { getBullJobIdForEmailOperation } from '../email.helper'
import { EMAIL_TYPES } from '../email.config'
import { OpsCtx } from '../../../types'

export class EmailSendOperation extends WorkerBaseOperation<
  OpsCtx,
  SendEmailJob['payload'],
  boolean
> {

  static getBullJobId = (emailType: EMAIL_TYPES, customSuffix?: string): string => {
    return getBullJobIdForEmailOperation(emailType, customSuffix)
  }

  async run(input: SendEmailJob['payload']): Promise<boolean> {
    if (config.emails.salesforce.isEnabled) {
      try {
        // todo: consider bulk sending since we need to login and everything
        await emailClient.login()
        await emailClient.sendEmail(input)
        return true
      } catch (err) {
        this.ctx.log.error({ err }, 'Salesforce client failed')
        throw err
      }
    }
    await helper.saveEmailToFile(input, `test-${Date.now().toString()}`)
    return true
  }
}
