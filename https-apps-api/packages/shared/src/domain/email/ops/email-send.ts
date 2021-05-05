import { WorkerBaseOperation } from '../../../utils/base-operation'
import type { SendEmailJob } from '../../../queue/task.input'
import type { Maybe } from '../../../types'
import * as helper from '../email.helper'
import { config } from '../../../config'
import { emailClient } from '../../../services/salesforce.service'

export class EmailSendOperation extends WorkerBaseOperation<
  SendEmailJob['payload'],
  Maybe<unknown>
> {
  async run(input: SendEmailJob['payload']): Promise<void> {
    console.log(input, 'EMAIL JOB INPUT')
    console.log(this.ctx.user, 'EMAIL JOB INPUT user')
    // for now, it only prints to a file
    if (config.emails.salesforce.isEnabled) {
      console.log('salesforce login test')
      const res = await emailClient.login()
      console.log(res, 'salesforce response')
    } else {
      // default "strategy"
      await helper.saveEmailToFile(input, `test-${Date.now()}`)
    }
  }
}
