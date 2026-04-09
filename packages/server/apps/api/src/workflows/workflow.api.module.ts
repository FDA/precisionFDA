import { Module } from '@nestjs/common'
import { LicenseApiFacadeModule } from '../facade/license/license-api-facade.module'
import { WorkflowController } from './workflow.controller'

@Module({
  imports: [LicenseApiFacadeModule],
  controllers: [WorkflowController],
})
export class WorkflowApiModule {}
