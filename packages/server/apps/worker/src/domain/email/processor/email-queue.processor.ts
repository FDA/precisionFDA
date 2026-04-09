import { Processor } from '@nestjs/bull'
import { Job } from 'bull'
import { config } from '@shared/config'
import { EmailSendService } from '@shared/domain/email/email-send.service'
import { TASK_TYPE } from '@shared/queue/task.input'
import { ProcessWithContext } from '../../../queues/decorator/process-with-context'

@Processor(config.workerJobs.queues.emails.name)
export class EmailQueueProcessor {
  constructor(private readonly emailSendService: EmailSendService) {}
  @ProcessWithContext(TASK_TYPE.SEND_EMAIL)
  async sendEmail(job: Job): Promise<void> {
    await this.emailSendService.sendEmail(job.data.payload)
  }
}
