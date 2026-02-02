import { Module } from '@nestjs/common'
import { WorkflowService } from '@shared/domain/workflow/service/workflow.service'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Workflow } from '@shared/domain/workflow/entity/workflow.entity'
import { WorkflowSeries } from '@shared/domain/workflow-series/workflow-series.entity'
import { WorkflowCountService } from '@shared/domain/workflow/service/workflow-count.service'
import { WorkflowScopeFilterProvider } from '@shared/domain/workflow/workflow-scope-filter.provider'

@Module({
  imports: [MikroOrmModule.forFeature([Workflow, WorkflowSeries])],
  providers: [WorkflowService, WorkflowCountService, WorkflowScopeFilterProvider],
  exports: [WorkflowService, MikroOrmModule],
})
export class WorkflowModule {}
