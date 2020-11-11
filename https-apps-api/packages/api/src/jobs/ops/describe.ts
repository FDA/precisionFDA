import { client, errors } from '@pfda/https-apps-shared'
import { BaseOperation } from '../../utils'
import { Job } from '..'
import type { DescribeJobInput } from '../domain/job.input'
import { TERMINAL_STATES } from '../domain/job.enum'
import { User } from '../../users'

export class DescribeJobOperation extends BaseOperation<DescribeJobInput, Job> {
  async run(input: DescribeJobInput) {
    const em = this.ctx.em
    const jobRepo = em.getRepository(Job)
    const job = await jobRepo.findOne({
      dxid: input.dxid,
      // FIXME: JUPYTER APP JOBS DO NOT CURRENTLY HAVE THE APP ASSIGNED LOCALLY
      // app: input.appId ? em.getReference(App, input.appId) : null,
      user: em.getReference(User, this.ctx.user.id),
    })
    if (!job) {
      throw new errors.JobNotFoundError()
    }
    if (job.state && Object.values(TERMINAL_STATES).includes(job.state)) {
      // no need to ping the API for results
      return job
    }
    const platformJobData = await client.jobDescribe({
      jobId: input.dxid,
      accessToken: this.ctx.user.accessToken,
    })
    // todo: updates:
    //  the describe field for istance
    //  status of the job if it differs
    // the DNS entry - if found, should be PRESIGNED
    this.ctx.log.debug({ platformJobData }, 'JOB description object from the platform')
    return job
  }
}
