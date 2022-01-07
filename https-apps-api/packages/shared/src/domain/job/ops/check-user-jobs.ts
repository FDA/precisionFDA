import { WorkerBaseOperation } from '../../../utils/base-operation'
import { BasicUserJob } from '../../../queue/task.input'
import { Job } from '../job.entity'
import { Maybe } from '../../../types'
import { JOB_DB_ENTITY_TYPE } from '../job.enum'
import { buildIsOverMaxDuration } from '../job.helper'
import { JobDescribeResponse, PlatformClient } from '../../../platform-client'
import { wrap } from '@mikro-orm/core'
import { SyncJobOperation } from './synchronize'
import { findRepeatable, createSyncJobStatusTask } from '../../../queue'

// Check jobs for a given user, to be run when user logs in to clean up
// old states that are stuck because sync jobs are missing.
export class CheckUserJobsOperation extends WorkerBaseOperation<
  BasicUserJob['payload'],
  Maybe<Job[]>
> {
  protected client: PlatformClient

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
    if (staleJobs.length == 0) {
      this.ctx.log.info({}, 'CheckUserJobsOperation: No stale jobs found')
    }
    else {
      this.ctx.log.info(
        { staleJobs: staleJobs.map(job => ({
            jobId: job.id,
            jobState: job.state,
          }))
        },
        'CheckUserJobsOperation: Stale jobs - should be terminated',
      )
    }

    // For each running job, find the current status and sync with platform to resolve old states
    // There are cases where job's status sync is outdated (e.g. token issues) and we need to
    // have a failsafe where we recreate the job sync task
    this.client = new PlatformClient(this.ctx.log)
    await Promise.all(runningJobs.map(async (job) => {
      try {
        let platformJobData: JobDescribeResponse = await this.client.jobDescribe({
          jobId: job.dxid,
          accessToken: this.ctx.user.accessToken,
        })

        if (job.state !== platformJobData.state) {
          this.ctx.log.info({
            jobState: job.state,
            platformJobState: platformJobData.state,
          }, 'CheckUserJobsOperation: Local job state not the same as platform state')
  
          if (job.entityType = JOB_DB_ENTITY_TYPE.HTTPS) {
            this.ctx.log.info({}, 'CheckStaleJobsOperation: This is an HTTPS app')
          }

          const bullJobId = SyncJobOperation.getBullJobId(job.dxid)
          const bullJob = findRepeatable(bullJobId)
          if (!bullJob) {
            await createSyncJobStatusTask({ dxid: job.dxid }, this.ctx.user)
            this.ctx.log.warn({ 
              jobDxid: job.dxid,
              bullJobId: bullJobId,
            }, 'CheckUserJobsOperation: Status sync task for job missing, recreating it')
          }
          else {
            this.ctx.log.info({ 
              jobDxid: job.dxid,
              bullJobId: bullJobId,
            }, 'CheckUserJobsOperation: Status sync task found, everything is fine')

            // Todo: there is still the possible case that a sync task exist but it failed to
            //       run at some point and it becomes a repeatable job stuck in the queue
          }
        }
        else {
          this.ctx.log.info({
            jobState: job.state,
            platformJobState: platformJobData.state,
          }, 'CheckUserJobsOperation: Local job state is consistent with platform')
        }
      } catch (err) {
        this.ctx.log.info({ error: err },
          'CheckUserJobsOperation: Encountered error describing job on platform')
      }
    }))

    return staleJobs
  }
}
