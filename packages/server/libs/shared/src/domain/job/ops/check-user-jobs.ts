/* eslint-disable @typescript-eslint/no-floating-promises */
import { createSyncJobStatusTask, findRepeatable, getMainQueue, removeRepeatableJob } from '@shared/queue'
import { WorkerBaseOperation } from '../../../utils/base-operation'
import { Job } from '../job.entity'
import type { Maybe, UserOpsCtx, UserCtx } from '../../../types'
import { buildIsOverMaxDuration } from '../job.helper'
import { isJobOrphaned } from '../../../queue/queue.utils'
import { JobRepository } from '../job.repository'
import { SyncJobOperation } from './synchronize'

const recreateJobStatusSyncIfMissing = async (job: Job, user: UserCtx, log: any): Promise<void> => {
  const bullJobId = SyncJobOperation.getBullJobId(job.dxid)
  const bullJob = await findRepeatable(bullJobId)
  if (!bullJob) {
    log.warn({
      jobDxid: job.dxid,
      bullJobId,
    }, 'Status sync task for job missing, recreating it')
    await createSyncJobStatusTask({ dxid: job.dxid }, user)
  } else if (isJobOrphaned(bullJob)) {
    log.log({
      jobDxid: job.dxid,
      bullJob,
    }, 'Status sync task found, but it is orphaned. '
       + 'Removing and recreating it')
    await removeRepeatableJob(bullJob, getMainQueue())
    await createSyncJobStatusTask({ dxid: job.dxid }, user)
  } else {
    log.log({
      jobDxid: job.dxid,
      bullJob,
    }, 'Status sync task found, everything is fine')
  }
}


// Check jobs for a given user, to be run when user logs in to clean up
// old states that are stuck because sync jobs are missing.
export class CheckUserJobsOperation extends WorkerBaseOperation<
  UserOpsCtx,
  never,
  Maybe<Job[]>
> {
  async run(): Promise<Maybe<Job[]>> {
    const em = this.ctx.em
    const jobRepo: JobRepository = em.getRepository(Job)
    const runningJobs = await jobRepo.findRunningJobsByUser({ userId: this.ctx.user.id })
    this.ctx.log.log({
      runningJobsCount: runningJobs.length,
    }, 'Checking for running jobs')

    // Find running jobs that are over the max duration
    const isOverMaxDuration = buildIsOverMaxDuration('terminate')
    const staleJobs: Job[] = runningJobs.filter(job => isOverMaxDuration(job))
    if (staleJobs.length === 0) {
      this.ctx.log.log({}, 'No stale jobs found')
    } else {
      this.ctx.log.log(
        {
          staleJobs: staleJobs.map(job => ({
            jobId: job.id,
            jobDxid: job.dxid,
            jobState: job.state,
          })),
        },
        'Stale jobs - should be terminated',
      )
    }

    // It is better to loop synchronously so that logs are colocated correctly and can be read logically
    // and that we space out platform calls a little (lest we run into any rate limiter)
    for (const job of runningJobs) {
      // console.log(`Inspecting job: ${job.dxid} ${job.state}`)
      // Recreate the sync task
      // eslint-disable-next-line no-await-in-loop
      await recreateJobStatusSyncIfMissing(job, this.ctx.user, this.ctx.log)
    }

    return staleJobs
  }
}
