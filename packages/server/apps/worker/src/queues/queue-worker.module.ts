import { Module } from '@nestjs/common'
import { DebugModule } from '@shared/debug/debug.module'
import { ChallengeModule } from '@shared/domain/challenge/challenge.module'
import { DataPortalModule } from '@shared/domain/data-portal/data-portal.module'
import { DbClusterModule } from '@shared/domain/db-cluster/db-cluster.module'
import { JobModule } from '@shared/domain/job/job.module'
import { SpaceReportModule } from '@shared/domain/space-report/space-report.module'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'
import { UserModule } from '@shared/domain/user/user.module'
import { UserFacadeModule } from '@shared/facade/user/user-facade.module'
import { QueueModule } from '@shared/queue/queue.module'
import { UserFileWorkerModule } from '../domain/user-file/user-file.worker.module'
import { MainQueueProcessor } from './processor/main-queue.processor'
import { MaintenanceQueueProcessor } from './processor/maintenance-queue.processor'
import { DiscussionModule } from '@shared/domain/discussion/discussion.module'
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
    DiscussionModule,
    UserFacadeModule,
    DbClusterModule,
  ],
  providers: [MainQueueProcessor, MaintenanceQueueProcessor],
})
export class QueueWorkerModule {}
