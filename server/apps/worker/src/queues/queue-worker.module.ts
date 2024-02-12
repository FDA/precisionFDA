import { Module } from '@nestjs/common'
import { SpaceReportModule } from '@shared/domain/space-report/space-report.module'
import { QueueModule } from '@shared/queue/queue.module'
import { MainQueueProcessor } from './processor/main-queue.processor'
import { MaintenanceQueueProcessor } from './processor/maintenance-queue.processor'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'
import { DataPortalModule } from '@shared/domain/data-portal/data-portal.module'
import { ChallengeModule } from '@shared/domain/challenge/challenge.module'
import { UserFileWorkerModule } from '../domain/user-file/user-file.worker.module'

@Module({
  imports: [
    QueueModule,
    UserFileModule,
    DataPortalModule,
    ChallengeModule,
    UserFileWorkerModule,
    SpaceReportModule,
  ],
  providers: [MainQueueProcessor, MaintenanceQueueProcessor],
})
export class QueueWorkerModule {}
