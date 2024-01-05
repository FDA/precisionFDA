import { Process, Processor } from '@nestjs/bull'
import { config, queue } from '@shared'
import { Job } from 'bull'
import { sendEmailHandler } from '../../../jobs/send-email.handler'

@Processor(config.workerJobs.queues.emails.name)
export class EmailQueueProcessor {
  @Process(queue.types.TASK_TYPE.SEND_EMAIL)
  async sendEmail(job: Job) {
    await sendEmailHandler(job)
  }
}
