import { Module } from '@nestjs/common'
import { SpaceReportModule } from '@shared/domain/space-report/space-report.module'
import { FileSyncQueueProcessor } from './processor/file-sync-queue.processor'
import { FollowUpDecider } from './follow-up-decider'
import { ResourceModule } from '@shared/domain/resource/resource.module'
import { DataPortalModule } from '@shared/domain/data-portal/data-portal.module'
import { ChallengeModule } from '@shared/domain/challenge/challenge.module'

@Module({
  imports: [ResourceModule, DataPortalModule, ChallengeModule, SpaceReportModule],
  providers: [FileSyncQueueProcessor, FollowUpDecider],
  exports: [FollowUpDecider],
})
export class UserFileWorkerModule {}
