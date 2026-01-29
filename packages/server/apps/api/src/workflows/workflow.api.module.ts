import { Module } from '@nestjs/common'
import { WorkflowController } from './workflow.controller'
import { LicenseApiFacadeModule } from '../facade/license/license-api-facade.module'

@Module({
  imports: [LicenseApiFacadeModule],
  controllers: [WorkflowController],
})
export class WorkflowApiModule {}
