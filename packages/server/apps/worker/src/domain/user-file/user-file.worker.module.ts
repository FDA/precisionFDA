import { Module } from '@nestjs/common'
import { ChallengeModule } from '@shared/domain/challenge/challenge.module'
import { DataPortalModule } from '@shared/domain/data-portal/data-portal.module'
import { JobModule } from '@shared/domain/job/job.module'
import { NotificationModule } from '@shared/domain/notification/notification.module'
import { ResourceModule } from '@shared/domain/resource/resource.module'
import { SpaceReportModule } from '@shared/domain/space-report/space-report.module'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'
import { UserModule } from '@shared/domain/user/user.module'
import { RemoveNodesFacadeModule } from '@shared/facade/node-remove/remove-nodes-facade.module'
import { UserFacadeModule } from '@shared/facade/user/user-facade.module'
import { FollowUpDecider } from './follow-up-decider'
import { FileSyncQueueProcessor } from './processor/file-sync-queue.processor'

@Module({
  imports: [
    ResourceModule,
    DataPortalModule,
    ChallengeModule,
    SpaceReportModule,
    UserModule,
    UserFileModule,
    JobModule,
    NotificationModule,
    RemoveNodesFacadeModule,
    UserFacadeModule,
  ],
  providers: [FileSyncQueueProcessor, FollowUpDecider],
  exports: [FollowUpDecider],
})
export class UserFileWorkerModule {}
