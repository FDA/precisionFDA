import * as errors from '../../../errors'
import { OpsCtx } from '../../../types'
import { Job } from '..'
import { BaseOperation } from '../../../utils/base-operation'
import { JobRepository } from '../job.repository'

abstract class WorkstationBaseOperation<CtxT extends OpsCtx, In, Out>
  extends BaseOperation<CtxT, In, Out> {
  protected async validatedJob(jobDxid: string): Promise<Job> {
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

  protected async validatedJobWithWorkstationAPI(jobDxid: string): Promise<Job> {
    const job = await this.validatedJob(jobDxid)
    if (!job.app?.getEntity().hasWorkstationAPI) {
      throw new errors.InvalidStateError(`Job ${job.uid} does not have workstation API`)
    }
    return job
  }
}

export {
  WorkstationBaseOperation,
}
