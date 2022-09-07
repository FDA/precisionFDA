import * as errors from '../../../errors'
import * as client from '../../../platform-client'
import { BaseOperation } from '../../../utils'
import { Job } from '../job.entity'
import { WorkstationSyncFilesInput } from '../job.input'
import { JOB_STATE } from '../job.enum'
import { ENTITY_TYPE } from '../../app/app.enum'
import { createSyncWorkstationFilesTask } from '../../../queue'
import { getJobAccessibleByContext } from '../job.permissions'
import { UserOpsCtx } from '../../../types'


export class RequestWorkstationSyncFilesOperation extends BaseOperation<UserOpsCtx, WorkstationSyncFilesInput, Job> {
  async run(input: WorkstationSyncFilesInput): Promise<Job> {
    const job = await getJobAccessibleByContext(input.dxid, this.ctx)

    if (job.entityType !== ENTITY_TYPE.HTTPS) {
      throw new errors.InvalidStateError('RequestWorkstationSyncFilesOperation: Job is not HTTPS job.')
    }

    if (input.force) {
      this.ctx.log.info('RequestWorkstationSyncFilesOperation: Force mode enabled, ignoring job state')
    }
    else if (job.state !== JOB_STATE.RUNNING) {
      throw new errors.InvalidStateError('RequestWorkstationSyncFilesOperation: Job is currently not running.')
    }

    await createSyncWorkstationFilesTask({ dxid: job.dxid }, this.ctx.user)
    return job
  }
}
