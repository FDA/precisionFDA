import { wrap } from '@mikro-orm/core'
import { CheckStatusJob } from '../../../queue/task.input'
import { WorkerBaseOperation } from '../../../utils/base-operation'
import { Job } from '../job.entity'
import { isStateTerminal, shouldSyncStatus } from '../job.helper'
import * as client from '../../../platform-client'
import { removeRepeatable } from '../../../queue'

export class SyncJobOperation extends WorkerBaseOperation<CheckStatusJob['payload'], Job> {
  async run(input: CheckStatusJob['payload']): Promise<Job> {
    const em = this.ctx.em
    const jobRepo = em.getRepository(Job)
    const job = await jobRepo.findOne({ dxid: input.dxid })

    if (!job) {
      this.ctx.log.warn({ input }, 'Job does not exist')
      await removeRepeatable(this.ctx.job)
      return
    }

    // todo: check users ownership -> we should have a helper for it
    if (!shouldSyncStatus(job)) {
      this.ctx.log.info({ input, job }, 'Job is already finished')
      await removeRepeatable(this.ctx.job)
      return
    }
    // we want to synchronize the job status if it is not yet terminated
    let platformJobData: client.JobDescribeResponse
    try {
      platformJobData = await client.jobDescribe({
        jobId: input.dxid,
        accessToken: this.ctx.user.accessToken,
      })
    } catch (err) {
      // handle WORKER dirty state here
      // we could do more efficient error handling and also calls repetition here
      await removeRepeatable(this.ctx.job)
      return
    }
    // fixme: the mapping is not perfect for the https apps
    const remoteState = platformJobData.state
    if (remoteState === job.state) {
      this.ctx.log.info({ remoteState }, 'State has not changed, no updates')
      return
    }

    if (isStateTerminal(remoteState)) {
      // todo: if job.state === done there is more sync tasks to do (filess)
      this.ctx.log.debug({ remoteState }, 'We will do lots of updates')
    }
    this.ctx.log.info({ jobId: input.dxid }, 'Updating job, state change discovered')
    const updatedJob = wrap(job).assign(
      {
        describe: JSON.stringify(platformJobData),
        state: platformJobData.state,
      },
      { em },
    )
    await em.flush()
    return updatedJob
  }
}
