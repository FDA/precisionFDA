import { Module } from '@nestjs/common'
import { LicenseApiFacadeModule } from '../facade/license/license-api-facade.module'
import { WorkflowsController } from './workflows.controller'

@Module({
  imports: [LicenseApiFacadeModule],
  controllers: [WorkflowsController],
})
export class WorkflowApiModule {}
