import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { WorkflowSeriesService } from './service/workflow-series.service'
import { WorkflowSeries } from './workflow-series.entity'
import { WorkflowSeriesCountService } from './workflow-series-count.service'
import { WorkflowSeriesScopeFilterProvider } from './workflow-series-scope-filter.provider'

@Module({
  imports: [MikroOrmModule.forFeature([WorkflowSeries])],
  providers: [WorkflowSeriesScopeFilterProvider, WorkflowSeriesCountService, WorkflowSeriesService],
  exports: [WorkflowSeriesService],
})
export class WorkflowSeriesModule {}
