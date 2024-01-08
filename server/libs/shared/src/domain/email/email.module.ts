import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'
import { config } from '@shared/config'

@Module({
  imports: [
    BullModule.registerQueue({
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
  exports: [BullModule],
})
export class EmailModule {}
