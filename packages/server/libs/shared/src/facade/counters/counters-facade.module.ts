import { Module } from '@nestjs/common'
import { AppSeriesModule } from '@shared/domain/app-series/app-series.module'
import { DbClusterModule } from '@shared/domain/db-cluster/db-cluster.module'
import { DiscussionModule } from '@shared/domain/discussion/discussion.module'
import { JobModule } from '@shared/domain/job/job.module'
import { SpaceModule } from '@shared/domain/space/space.module'
import { SpaceMembershipModule } from '@shared/domain/space-membership/space-membership.module'
import { SpaceReportModule } from '@shared/domain/space-report/space-report.module'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'
import { WorkflowSeriesModule } from '@shared/domain/workflow-series/workflow-series.module'
import { CountersFacade } from './counters.facade'

@Module({
  imports: [
    UserFileModule,
    AppSeriesModule,
    JobModule,
    DbClusterModule,
    WorkflowSeriesModule,
    SpaceReportModule,
    DiscussionModule,
    SpaceModule,
    SpaceMembershipModule,
  ],
  providers: [CountersFacade],
  exports: [CountersFacade],
})
export class CountersFacadeModule {}
