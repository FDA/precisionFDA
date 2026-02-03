import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { WorkflowSeries } from './workflow-series.entity'
import { WorkflowSeriesScopeFilterProvider } from './workflow-series-scope-filter.provider'
import { WorkflowSeriesCountService } from './workflow-series-count.service'
import { WorkflowSeriesService } from './service/workflow-series.service'

@Module({
  imports: [MikroOrmModule.forFeature([WorkflowSeries])],
  providers: [WorkflowSeriesScopeFilterProvider, WorkflowSeriesCountService, WorkflowSeriesService],
  exports: [WorkflowSeriesService],
})
export class WorkflowSeriesModule {}
