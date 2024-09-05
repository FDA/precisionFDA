import { Processor } from '@nestjs/bull'
import { config } from '@shared/config'
import { TASK_TYPE } from '@shared/queue/task.input'
import { Job } from 'bull'
import { ProcessWithContext } from '../../../queues/decorator/process-with-context'
import { EmailSendService } from '@shared/domain/email/email-send.service'

@Processor(config.workerJobs.queues.emails.name)
export class EmailQueueProcessor {
  constructor(private readonly emailSendService: EmailSendService) {}
  @ProcessWithContext(TASK_TYPE.SEND_EMAIL)
  async sendEmail(job: Job) {
    await this.emailSendService.sendEmail(job.data.payload)
  }
}
