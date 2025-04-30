import { Module } from '@nestjs/common'
import { WorkflowService } from '@shared/domain/workflow/service/workflow.service'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Workflow } from '@shared/domain/workflow/entity/workflow.entity'

@Module({
  imports: [MikroOrmModule.forFeature([Workflow])],
  providers: [WorkflowService],
  exports: [WorkflowService, MikroOrmModule],
})
export class WorkflowModule {}
