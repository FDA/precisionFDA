import { Module } from '@nestjs/common'
import { DebugModule } from '@shared/debug/debug.module'
import { ChallengeModule } from '@shared/domain/challenge/challenge.module'
import { DataPortalModule } from '@shared/domain/data-portal/data-portal.module'
import { DbClusterModule } from '@shared/domain/db-cluster/db-cluster.module'
import { DiscussionModule } from '@shared/domain/discussion/discussion.module'
import { EmailModule } from '@shared/domain/email/email.module'
import { JobModule } from '@shared/domain/job/job.module'
import { SpaceMembershipModule } from '@shared/domain/space-membership/space-membership.module'
import { SpaceReportModule } from '@shared/domain/space-report/space-report.module'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'
import { UserModule } from '@shared/domain/user/user.module'
import { JobFacadeModule } from '@shared/facade/job/job-facade.module'
import { SpaceMemberNotificationFacadeModule } from '@shared/facade/space-member-notification/space-member-notification-facade.module'
import { SyncFilesStateFacadeModule } from '@shared/facade/sync-file-state/sync-files-state-facade.module'
import { UserFacadeModule } from '@shared/facade/user/user-facade.module'
import { QueueModule } from '@shared/queue/queue.module'
import { DbClusterCheckNonTerminatedFacadeModule } from 'apps/api/src/facade/db-cluster/check-non-terminated-facade/db-cluster-check-non-terminated-facade.module'
import { DbClusterSynchronizeFacadeModule } from 'apps/api/src/facade/db-cluster/synchronize-facade/db-cluster-synchronize-facade.module'
import { UserFileWorkerModule } from '../domain/user-file/user-file.worker.module'
import { MainQueueProcessor } from './processor/main-queue.processor'
import { MaintenanceQueueProcessor } from './processor/maintenance-queue.processor'

@Module({
  imports: [
    QueueModule,
    UserFileModule,
    DataPortalModule,
    ChallengeModule,
    UserFileWorkerModule,
    SpaceReportModule,
    SpaceMembershipModule,
    DbClusterModule,
    UserModule,
    DebugModule,
    SyncFilesStateFacadeModule,
    JobModule,
    DiscussionModule,
    UserFacadeModule,
    EmailModule,
    DbClusterCheckNonTerminatedFacadeModule,
    DbClusterSynchronizeFacadeModule,
    SpaceMemberNotificationFacadeModule,
    JobFacadeModule,
  ],
  providers: [MainQueueProcessor, MaintenanceQueueProcessor],
})
export class QueueWorkerModule {}
