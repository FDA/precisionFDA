import { Module } from '@nestjs/common'
import { SpaceReportModule } from '@shared/domain/space-report/space-report.module'
import { UserModule } from '@shared/domain/user/user.module'
import { QueueModule } from '@shared/queue/queue.module'
import { MainQueueProcessor } from './processor/main-queue.processor'
import { MaintenanceQueueProcessor } from './processor/maintenance-queue.processor'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'
import { DataPortalModule } from '@shared/domain/data-portal/data-portal.module'
import { ChallengeModule } from '@shared/domain/challenge/challenge.module'
import { UserFileWorkerModule } from '../domain/user-file/user-file.worker.module'
import { DebugModule } from '@shared/debug/debug.module'
import { DbClusterModule } from '@shared/domain/db-cluster/db-cluster.module'
import { JobModule } from '@shared/domain/job/job.module'
@Module({
  imports: [
    QueueModule,
    UserFileModule,
    DataPortalModule,
    ChallengeModule,
    UserFileWorkerModule,
    SpaceReportModule,
    DbClusterModule,
    UserModule,
    DebugModule,
    JobModule,
  ],
  providers: [MainQueueProcessor, MaintenanceQueueProcessor],
})
export class QueueWorkerModule {}
