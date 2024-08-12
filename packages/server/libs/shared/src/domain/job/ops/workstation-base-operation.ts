import { DxId } from '@shared/domain/entity/domain/dxid'
import { Job } from '@shared/domain/job/job.entity'
import { BaseOperation } from '@shared/utils/base-operation'
import * as errors from '../../../errors'
import { OpsCtx } from '../../../types'

abstract class WorkstationBaseOperation<CtxT extends OpsCtx, In, Out> extends BaseOperation<
  CtxT,
  In,
  Out
> {
  protected async validatedJob(jobDxid: DxId<'job'>): Promise<Job> {
    const jobRepo = this.ctx.em.getRepository(Job)
    const job = await jobRepo.findOne({ dxid: jobDxid }, { populate: ['app'] })
    if (!job) {
      throw new errors.JobNotFoundError(`Job ${jobDxid} not found or inaccessible`)
    }

    if (!job.isHTTPS()) {
      throw new errors.InvalidStateError(`Job ${job.uid} is not an HTTPS app`)
    }
    return job
  }

  protected async validatedJobWithWorkstationAPI(jobDxid: DxId<'job'>): Promise<Job> {
    const job = await this.validatedJob(jobDxid)
    if (!job.app?.getEntity().hasWorkstationAPI) {
      throw new errors.InvalidStateError(`Job ${job.uid} does not have workstation API`)
    }
    return job
  }
}

export { WorkstationBaseOperation }
