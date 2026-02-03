import { Module } from '@nestjs/common'
import { CountersFacade } from './counters.facade'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'
import { AppSeriesModule } from '@shared/domain/app-series/app-series.module'
import { JobModule } from '@shared/domain/job/job.module'
import { DbClusterModule } from '@shared/domain/db-cluster/db-cluster.module'
import { WorkflowSeriesModule } from '@shared/domain/workflow-series/workflow-series.module'
import { SpaceReportModule } from '@shared/domain/space-report/space-report.module'
import { DiscussionModule } from '@shared/domain/discussion/discussion.module'

@Module({
  imports: [
    UserFileModule,
    AppSeriesModule,
    JobModule,
    DbClusterModule,
    WorkflowSeriesModule,
    SpaceReportModule,
    DiscussionModule,
  ],
  providers: [CountersFacade],
  exports: [CountersFacade],
})
export class CountersFacadeModule {}
