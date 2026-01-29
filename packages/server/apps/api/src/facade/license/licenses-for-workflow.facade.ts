import { Injectable } from '@nestjs/common'
import { Uid } from '@shared/domain/entity/domain/uid'
import { License } from '@shared/domain/license/license.entity'
import { WorkflowService } from '@shared/domain/workflow/service/workflow.service'
import { NotFoundError } from '@shared/errors'
import { LicensesForAppFacade } from './licenses-for-app.facade'

@Injectable()
export class LicensesForWorkflowFacade {
  constructor(
    private readonly workflowService: WorkflowService,
    private readonly licensesForAppFacade: LicensesForAppFacade,
  ) {}

  async findLicensesForWorkflow(uid: Uid<'workflow'>): Promise<License[]> {
    const workflow = await this.workflowService.getAccessibleEntityByUid(uid)
    if (!workflow) {
      throw new NotFoundError(`Workflow not found ({ uid: '${uid}' })`)
    }

    const licenseArrays = await Promise.all(
      workflow.spec.input_spec.stages.map((stage) =>
        this.licensesForAppFacade.findLicensesForApp(stage.app_uid),
      ),
    )

    const licenses = licenseArrays.flat()
    return [...new Map(licenses.map((item) => [item.id, item])).values()]
  }
}
