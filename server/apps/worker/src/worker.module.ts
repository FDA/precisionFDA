import { Module } from '@nestjs/common'
import { LoggerModule } from '@shared/logger/logger.module'
import { DatabaseWorkerModule } from './database/database.worker.module'
import { EmailWorkerModule } from './domain/email/email.worker.module'
import { SpaceReportWorkerModule } from './domain/space-report/space-report.worker.module'
import { UserContextModule } from './domain/user-context/user-context.module'
import { UserFileWorkerModule } from './domain/user-file/user-file.worker.module'
import { QueueWorkerModule } from './queues/queue-worker.module'

@Module({
  imports: [
    DatabaseWorkerModule,
    LoggerModule,
    UserContextModule,
    QueueWorkerModule,
    SpaceReportWorkerModule,
    EmailWorkerModule,
    UserFileWorkerModule,
  ],
})
export class WorkerModule {}
