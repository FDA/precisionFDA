import { Module } from '@nestjs/common'
import { AcceptedLicenseModule } from '@shared/domain/accepted-license/accepted-license.module'
import { AppModule } from '@shared/domain/app/app.module'
import { LicenseModule } from '@shared/domain/license/license.module'
import { WorkflowModule } from '@shared/domain/workflow/workflow.module'
import { AcceptLicenseFacade } from './accept-license.facade'
import { LicensesForAppFacade } from './licenses-for-app.facade'
import { LicensesForWorkflowFacade } from './licenses-for-workflow.facade'

@Module({
  imports: [AppModule, LicenseModule, WorkflowModule, AcceptedLicenseModule],
  providers: [LicensesForAppFacade, LicensesForWorkflowFacade, AcceptLicenseFacade],
  exports: [LicensesForAppFacade, LicensesForWorkflowFacade, AcceptLicenseFacade],
})
export class LicenseApiFacadeModule {}
