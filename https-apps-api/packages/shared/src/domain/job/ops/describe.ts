import { wrap } from '@mikro-orm/core'
import * as client from '../../../platform-client'
import * as errors from '../../../errors'
import { BaseOperation } from '../../../utils'
import { Job } from '../job.entity'
import type { DescribeJobInput } from '../job.input'
import { getJobAccessibleByContext } from '../job.permissions'
import { UserOpsCtx } from '../../../types'

export class DescribeJobOperation extends BaseOperation<UserOpsCtx, DescribeJobInput, Job> {
  async run(input: DescribeJobInput): Promise<Job> {
    const em = this.ctx.em
    const platformClient = new client.PlatformClient(this.ctx.user.accessToken, this.ctx.log)

    const job = await getJobAccessibleByContext(input.dxid, this.ctx)
    await em.populate(job, ['app', 'user'])
    // TODO: only populate necessary fields:
    // await em.populate(job, [
    //   'app.id', 'app.dxid', 'app.uid', 'app.title',
    //   'user.id', 'user.dxuser', 'user.fullName',
    // ]);

    // if job is already finished (in our system), no need to synchronize
    if (job.state && job.isTerminal()) {
      this.ctx.log.debug({ job }, 'job state is terminated')
      return job
    }

    const platformJobData = await platformClient.jobDescribe({
      jobId: input.dxid,
    })
    this.ctx.log.debug({ platformJobData }, 'JOB description object from the platform')

    const shouldUpdateEntity = platformJobData.state !== job.state
    // if there is mismatch between platform state and local state, we synchronize the DB
    if (shouldUpdateEntity) {
      this.ctx.log.debug({ state: platformJobData.state }, 'updating to this state')
      wrap(job).assign(
        {
          describe: JSON.stringify(platformJobData),
          // todo: there are more states in the platform ("running" for example)
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
