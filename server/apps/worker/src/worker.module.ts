import { Module } from '@nestjs/common'
import { DatabaseModule, LoggerModule } from '@shared'
import { EmailWorkerModule } from './domain/email/email.worker.module'
import { SpaceReportWorkerModule } from './domain/space-report/space-report.worker.module'
import { UserContextModule } from './domain/user-context/user-context.module'
import { UserFileWorkerModule } from './domain/user-file/user-file.worker.module'
import { QueueWorkerModule } from './queues/queue-worker.module'

@Module({
  imports: [
    DatabaseModule,
    LoggerModule,
    UserContextModule,
    QueueWorkerModule,
    SpaceReportWorkerModule,
    EmailWorkerModule,
    UserFileWorkerModule,
  ],
})
export class WorkerModule {}
