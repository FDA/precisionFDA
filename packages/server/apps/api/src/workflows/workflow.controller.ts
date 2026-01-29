import { Controller, Get, Param, UseGuards } from '@nestjs/common'
import { License } from '@shared/domain/license/license.entity'
import { UserContextGuard } from '../user-context/guard/user-context.guard'
import { LicensesForWorkflowFacade } from '../facade/license/licenses-for-workflow.facade'
import { WorkflowUidParamDto } from './model/workflow-uid-param.dto'

@UseGuards(UserContextGuard)
@Controller('/workflows')
export class WorkflowController {
  constructor(private readonly licensesForWorkflowFacade: LicensesForWorkflowFacade) {}

  @Get('/:workflowUid/licenses-to-accept')
  async getLicencesToAccept(@Param() params: WorkflowUidParamDto): Promise<License[]> {
    return await this.licensesForWorkflowFacade.findLicensesForWorkflow(params.workflowUid)
  }
}
