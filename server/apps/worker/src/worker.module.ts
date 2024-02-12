import { Module } from '@nestjs/common'
import { DatabaseModule } from '@shared/database/database.module'
import { LoggerModule } from '@shared/logger/logger.module'
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
