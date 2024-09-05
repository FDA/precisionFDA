import { Module } from '@nestjs/common'
import { SpaceReportModule } from '@shared/domain/space-report/space-report.module'
import { FileSyncQueueProcessor } from './processor/file-sync-queue.processor'
import { FollowUpDecider } from './follow-up-decider'
import { ResourceModule } from '@shared/domain/resource/resource.module'
import { DataPortalModule } from '@shared/domain/data-portal/data-portal.module'
import { ChallengeModule } from '@shared/domain/challenge/challenge.module'
import { UserModule } from '@shared/domain/user/user.module'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'
import { JobModule } from '@shared/domain/job/job.module'

@Module({
  imports: [
    ResourceModule,
    DataPortalModule,
    ChallengeModule,
    SpaceReportModule,
    UserModule,
    UserFileModule,
    JobModule,
  ],
  providers: [FileSyncQueueProcessor, FollowUpDecider],
  exports: [FollowUpDecider],
})
export class UserFileWorkerModule {}
