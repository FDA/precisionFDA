import { Module } from '@nestjs/common'
import { WorkflowService } from '@shared/domain/workflow/service/workflow.service'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Workflow } from '@shared/domain/workflow/entity/workflow.entity'
import { WorkflowSeries } from '@shared/domain/workflow-series/workflow-series.entity'

@Module({
  imports: [MikroOrmModule.forFeature([Workflow, WorkflowSeries])],
  providers: [WorkflowService],
  exports: [WorkflowService, MikroOrmModule],
})
export class WorkflowModule {}
