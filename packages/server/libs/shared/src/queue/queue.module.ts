import { Global, Module } from '@nestjs/common'
import { config } from '@shared/config'
import { EmailModule } from '@shared/domain/email/email.module'
import { SpaceReportModule } from '@shared/domain/space-report/space-report.module'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'
import { BullQueueModule } from '@shared/queue/module/bull-queue-module'
import { MainQueueJobProducer } from '@shared/queue/producer/main-queue-job.producer'
import { MaintenanceQueueJobProducer } from '@shared/queue/producer/maintenance-queue-job.producer'
import { QueueEventListener } from '@shared/queue/queue.event.listener'
import { QueueProxy } from '@shared/queue/queue.proxy'

@Global()
@Module({
  imports: [
    BullQueueModule.forRoot(),
    BullQueueModule.registerQueue({
      name: config.workerJobs.queues.default.name,
      defaultJobOptions: {
        // if set to false, it will eventually eat up space in the redis instance
        removeOnComplete: true,
        removeOnFail: true,
        priority: 3,
      },
    }),
    BullQueueModule.registerQueue({
      name: config.workerJobs.queues.maintenance.name,
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: true,
        priority: 10,
      },
    }),
    SpaceReportModule,
    EmailModule,
    UserFileModule,
  ],
  providers: [MainQueueJobProducer, MaintenanceQueueJobProducer, QueueProxy, QueueEventListener],
  exports: [BullQueueModule, MainQueueJobProducer, MaintenanceQueueJobProducer],
})
export class QueueModule {}
