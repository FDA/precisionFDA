import { Module } from '@nestjs/common'
import { WorkflowController } from './workflow.controller'

@Module({
  controllers: [WorkflowController],
})
export class WorkflowApiModule {}
