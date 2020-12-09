import * as errors from '../../../errors'
import { BaseOperation } from '../../../utils'
import { Job } from '../job.entity'
import { DxIdInput } from '../job.input'

export class RequestTerminateJobOperation extends BaseOperation<DxIdInput, Job> {
  async run(input: DxIdInput): Promise<Job> {
    // set to terminating
    const em = this.ctx.em
    const jobRepo = em.getRepository(Job)
    const job = await jobRepo.findOne({ dxid: input.dxid, user: this.ctx.user.id })
    // worker should set to terminated?
    if (!job) {
      throw new errors.JobNotFoundError()
    }
    // add task to the queue - OR it should pick it up automatically
    // call the platform API
    // set to terminating
  }
}
