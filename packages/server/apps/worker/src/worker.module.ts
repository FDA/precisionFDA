import { Module } from '@nestjs/common'
import { DevtoolsModule } from '@nestjs/devtools-integration'
import { config } from '@shared/config'
import { DatabaseModule } from '@shared/database/database.module'
import { UserContextModule } from '@shared/domain/user-context/user-context.module'
import { LoggerModule } from '@shared/logger/logger.module'
import { EmailWorkerModule } from './domain/email/email.worker.module'
import { SpaceReportWorkerModule } from './domain/space-report/space-report.worker.module'
import { UserFileWorkerModule } from './domain/user-file/user-file.worker.module'
import { QueueWorkerModule } from './queues/queue-worker.module'

@Module({
  imports: [
    DevtoolsModule.register({
      http: config.nestjsDevtoolsEnabled,
      port: 8001,
    }),
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
