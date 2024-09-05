import { DxId } from '@shared/domain/entity/domain/dxid'
import { BaseOperation } from '@shared/utils/base-operation'
import * as errors from '../../../errors'
import * as client from '../../../platform-client'
import { UserOpsCtx } from '../../../types'
import { Job } from '../job.entity'
import { JOB_STATE } from '../job.enum'
import { isStateTerminal } from '../job.helper'
import { DxIdInput } from '../job.input'

export class RequestTerminateJobOperation extends BaseOperation<UserOpsCtx, DxIdInput, Job> {
  async run(input: DxIdInput): Promise<Job> {
    const em = this.ctx.em
    const platformClient = new client.PlatformClient(
      { accessToken: this.ctx.user.accessToken },
      this.ctx.log,
    )

    const jobRepo = em.getRepository(Job)
    // scope is private/scope-x so this should work
    // no further checks, client-facing API should resolve whether given user can terminate given job (scopes)
    const job = await jobRepo.findOne({ dxid: input.dxid as DxId<'job'> })

    // input validations
    if (!job) {
      throw new errors.JobNotFoundError()
    }

    if (isStateTerminal(job.state) || job.state === JOB_STATE.TERMINATING) {
      this.ctx.log.log({ jobId: job.id, jobDxid: job.dxid }, 'Job is already terminating or terminated')
      throw new errors.InvalidStateError('Job is already terminating or terminated')
    }
    // call the platform API
    const apiResult = await platformClient.jobTerminate({
      jobId: job.dxid,
    })
    this.ctx.log.log({ jobId: job.id, jobDxId: job.dxid, apiResult }, 'Job set to terminate')
    // set to terminating
    job.state = JOB_STATE.TERMINATING
    await em.flush()

    return job
  }
}
