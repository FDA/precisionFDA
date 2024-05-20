import { Module } from '@nestjs/common'
import { WorkflowService } from '@shared/domain/workflow/service/workflow.service'

@Module({
  providers: [WorkflowService],
  exports: [WorkflowService],
})
export class WorkflowModule {}
