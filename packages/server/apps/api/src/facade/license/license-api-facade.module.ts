import { Module } from '@nestjs/common'
import { AppModule } from '@shared/domain/app/app.module'
import { LicenseModule } from '@shared/domain/license/license.module'
import { WorkflowModule } from '@shared/domain/workflow/workflow.module'
import { LicensesForAppFacade } from './licenses-for-app.facade'
import { LicensesForWorkflowFacade } from './licenses-for-workflow.facade'

@Module({
  imports: [AppModule, LicenseModule, WorkflowModule],
  providers: [LicensesForAppFacade, LicensesForWorkflowFacade],
  exports: [LicensesForAppFacade, LicensesForWorkflowFacade],
})
export class LicenseApiFacadeModule {}
