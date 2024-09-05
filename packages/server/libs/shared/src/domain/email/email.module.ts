import { Module } from '@nestjs/common'
import { config } from '@shared/config'
import { EmailQueueJobProducer } from '@shared/domain/email/producer/email-queue-job.producer'
import { BullQueueModule } from '@shared/queue/module/bull-queue-module'
import { EmailPrepareService } from '@shared/domain/email/templates/email-prepare.service'
import { EmailSendService } from '@shared/domain/email/email-send.service'
import { EmailFacade } from '@shared/domain/email/email.facade'

@Module({
  imports: [
    BullQueueModule.registerQueue({
      name: config.workerJobs.queues.emails.name,
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: true,
        attempts: 3, // Re-try sending the email a few times in case of network issue
        backoff: 5 * 60 * 1000, // 5 min delay between retries
        priority: 5,
      },
    }),
  ],
  providers: [EmailQueueJobProducer, EmailPrepareService, EmailSendService, EmailFacade],
  exports: [
    BullQueueModule,
    EmailQueueJobProducer,
    EmailPrepareService,
    EmailSendService,
    EmailFacade,
  ],
})
export class EmailModule {}
