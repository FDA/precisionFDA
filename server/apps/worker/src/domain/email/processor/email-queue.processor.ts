import { Processor } from '@nestjs/bull'
import { config } from '@shared/config'
import { TASK_TYPE } from '@shared/queue/task.input'
import { Job } from 'bull'
import { sendEmailHandler } from '../../../jobs/send-email.handler'
import { ProcessWithContext } from '../../../queues/decorator/process-with-context'

@Processor(config.workerJobs.queues.emails.name)
export class EmailQueueProcessor {
  @ProcessWithContext(TASK_TYPE.SEND_EMAIL)
  async sendEmail(job: Job) {
    await sendEmailHandler(job)
  }
}
