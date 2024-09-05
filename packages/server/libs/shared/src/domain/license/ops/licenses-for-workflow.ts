import { Uid } from '@shared/domain/entity/domain/uid'
import { Workflow } from '@shared/domain/workflow/entity/workflow.entity'
import { BaseOperation } from '@shared/utils/base-operation'
import { UidInput, UserOpsCtx } from '../../../types'
import { License } from '../license.entity'
import { LicensesForAppOperation } from './licenses-for-app'

/**
 * Operation that gets licenses attached to all apps in this workflow.
 */
export class LicensesForWorkflowOperation extends BaseOperation<UserOpsCtx, UidInput, any> {
  async run(input: UidInput): Promise<License[]> {
    const em = this.ctx.em

    const workflow = await em.findOneOrFail(Workflow, { uid: input.uid as Uid<'workflow'> })

    const licensePromises = workflow.spec.input_spec.stages.map((stage: any) =>
      new LicensesForAppOperation(this.ctx).execute({ uid: stage.app_uid }),
    )

    const licenses = (await Promise.all(licensePromises)).flat()

    // we don't want duplicates
    return [...new Map(licenses.map((item) => [item.id, item])).values()]
  }
}
