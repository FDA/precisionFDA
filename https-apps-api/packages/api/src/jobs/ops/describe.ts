import { wrap } from '@mikro-orm/core'
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

    // if job is already finished (in our system), no need to synchronize
    if (job.state && Object.values(TERMINAL_STATES).includes(job.state)) {
      this.ctx.log.debug({ job }, 'job state is terminated')
      return job
    }

    const platformJobData = await client.jobDescribe({
      jobId: input.dxid,
      accessToken: this.ctx.user.accessToken,
    })
    this.ctx.log.debug({ platformJobData }, 'JOB description object from the platform')

    const shouldUpdateEntity = platformJobData.state !== job.state
    // if there is mismatch between platform state and local state, we synchronize the DB
    if (shouldUpdateEntity) {
      this.ctx.log.debug({ state: platformJobData.state }, 'updating to this state')
      wrap(job).assign(
        {
          describe: JSON.stringify(platformJobData),
          state: platformJobData.state,
        },
        { em },
      )
      await em.flush()
    } else {
      this.ctx.log.debug({ job }, 'no updates to be done')
    }
    // if the job is still running, we want to provide presigned URL to the user
    // todo: updates:
    // the DNS entry - if found, should be PRESIGNED
    // currently not working now for some reason
    return job
  }
}
