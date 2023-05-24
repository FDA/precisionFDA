/* eslint-disable @typescript-eslint/no-floating-promises */
import { WorkerBaseOperation } from '../../../utils/base-operation'
import { Job } from '../job.entity'
import { Maybe, UserOpsCtx, UserCtx } from '../../../types'
import { buildIsOverMaxDuration } from '../job.helper'
import { queue } from '../../..'
import { isJobOrphaned } from '../../../queue/queue.utils'
import { SyncJobOperation } from './synchronize'


const recreateJobStatusSyncIfMissing = async (job: Job, user: UserCtx, log: any): Promise<void> => {
  if (!job.isHTTPS()) {
    // We can support resolving stale syncing of jobs of normal (non HTTPS) apps once
    // the job_syncing.rb business logic is reimplemented as nodejs operations
    // but for now we must skip these jobs
    log.info({}, 'CheckUserJobsOperation: This is not an HTTPS app, and currently unsupported by this opeartion')
    return
  }

  const bullJobId = SyncJobOperation.getBullJobId(job.dxid)
  const bullJob = await queue.findRepeatable(bullJobId)
  if (!bullJob) {
    log.warn({
      jobDxid: job.dxid,
      bullJobId,
    }, 'CheckUserJobsOperation: Status sync task for job missing, recreating it')
    await queue.createSyncJobStatusTask({ dxid: job.dxid }, user)
  } else if (isJobOrphaned(bullJob)) {
    log.info({
      jobDxid: job.dxid,
      bullJob,
    }, 'CheckUserJobsOperation: Status sync task found, but it is orphaned. '
       + 'Removing and recreating it')
    await queue.removeRepeatableJob(bullJob, queue.getMainQueue())
    await queue.createSyncJobStatusTask({ dxid: job.dxid }, user)
  } else {
    log.info({
      jobDxid: job.dxid,
      bullJob,
    }, 'CheckUserJobsOperation: Status sync task found, everything is fine')
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
    const jobRepo = em.getRepository(Job)
    const runningJobs = await jobRepo.findRunningJobsByUser({ userId: this.ctx.user.id })
    this.ctx.log.info({
      runningJobsCount: runningJobs.length,
    }, 'CheckUserJobsOperation: Checking for running jobs')

    // Find running jobs that are over the max duration
    const isOverMaxDuration = buildIsOverMaxDuration('terminate')
    const staleJobs: Job[] = runningJobs.filter(job => isOverMaxDuration(job))
    if (staleJobs.length === 0) {
      this.ctx.log.info({}, 'CheckUserJobsOperation: No stale jobs found')
    } else {
      this.ctx.log.info(
        { staleJobs: staleJobs.map(job => ({
          jobId: job.id,
          jobDxid: job.dxid,
          jobState: job.state,
        }))},
        'CheckUserJobsOperation: Stale jobs - should be terminated',
      )
    }

    // It is better to loop sychronously so that logs are colocated correctly and can be read logically
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
