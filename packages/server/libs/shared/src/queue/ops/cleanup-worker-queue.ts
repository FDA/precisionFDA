import { Logger } from '@nestjs/common'
import { SyncJobOperation } from '@shared/domain/job/ops/synchronize'
import { getEmailsQueue, getFileSyncQueue, getMainQueue } from '@shared/queue'
import { isNil } from 'ramda'
import { Job } from '../../domain/job/job.entity'
import { isStateTerminal } from '../../domain/job/job.helper'
import { OpsCtx } from '../../types'
import { BaseOperation } from '@shared/utils/base-operation'
import { clearFailedJobs } from '../queue.utils'
import { TASK_TYPE } from '../task.input'

// Clean up the bull queue
export const cleanupWorkerQueue = async (em: any, log: Logger): Promise<any> => {
  const now = Date.now()

  // Cleanup sync_job_status tasks whose job has already been terminated
  //
  // This also cleans up job sync tasks created before we assigned unique IDs
  //
  log.log('Cleaning up status queue')
  const mainQueue = getMainQueue()
  const repeatableJobs = await mainQueue.getRepeatableJobs()

  const jobRepo = em.getRepository(Job)
  const removedRepeatableJobs: any[] = []
  const possiblyExpiredJobs: any[] = []
  for (const job of repeatableJobs) {
    const timeSinceNext = now - job.next
    const hoursSinceNext = timeSinceNext / (60*60*1000)

    if (job.id?.startsWith(TASK_TYPE.SYNC_JOB_STATUS)) {
      const jobDxid = SyncJobOperation.getJobDxidFromBullJobId(job.id)
      log.log({ jobDxid, job }, 'Considering job sync task')
      const jobFromDb: Job = await jobRepo.findOne({ dxid: jobDxid })
      if (isNil(jobFromDb)) {
        log.log({
          jobDxid,
          hoursSinceNext,
        }, 'Removing job sync task because job does not exist in the db')
        removedRepeatableJobs.push({
          id: job.id,
          key: job.key,
          hoursSinceNext,
        })
        mainQueue.removeRepeatableByKey(job.key)
      }
      else if (isStateTerminal(jobFromDb.state)) {
        // Removing job sync if the job has terminated
        log.log({
          jobDxid,
          jobState: jobFromDb.state,
          hoursSinceNext,
        }, 'Removing job sync task because job has terminated')
        removedRepeatableJobs.push({
          id: job.id,
          key: job.key,
          hoursSinceNext,
        })
        mainQueue.removeRepeatableByKey(job.key)
      }
    }
    else {
      log.log({ job, hoursSinceNext }, 'Inspecting unhandled repeatable job')
    }

    if (hoursSinceNext > 1) {
      possiblyExpiredJobs.push({
        id: job.id,
        key: job.key,
        hoursSinceNext,
      })
      // The above is to inspect how often we get jobs whose 'next'
      // property in the past, after we have cleaned up the junk from existing queue
      // Leaving the above for the sake of studying the queue state in staging and production
      // mainQueue.removeRepeatableByKey(job.key)
    }
  }
  log.log({ removedRepeatableJobs }, 'Removed orphaned repeatable jobs')

  const failedStatusJobs = await clearFailedJobs(mainQueue, log)

  // Cleanup file sync queue
  //
  // Some observed cases where jobs have failed:
  //   "failedReason": "job stalled more than allowable limit"
  //
  const fileSyncQueue = getFileSyncQueue()
  const failedFileSyncJobs = await clearFailedJobs(fileSyncQueue, log)

  // Cleanup sent emails
  //
  // On staging/prod there were a lot of failed email tasks lingering around
  //
  log.log('Cleaning up email queue')
  const emailQueue = getEmailsQueue()
  const failedEmailJobs = await clearFailedJobs(emailQueue, log)

  // TODO - determine if we also need to clear completed items that aren't removed automatically
  //        these would be ones where the job config has removeOnComplete: false
  // clearCompletedJobs(emailQueue, log)

  return {
    removedRepeatableJobs,
    possiblyExpiredJobs,
    failedStatusJobs,
    failedFileSyncJobs,
    failedEmailJobs,
  }
}

// state: Any valid bull queue state like 'failed' or 'completed'
const clearJobs = async (q: any, state: any, log: any): Promise<any> => {
  const jobs = await q.getJobs(state)
  const count = jobs.length
  if (count > 0) {
    log.log({ jobs }, `Removing ${state} jobs from ${q.name}`)
    q.clean(0, state);
    log.log({ count }, `Removed ${count} ${state} jobs from ${q.name}`)
  }
  else {
    log.log(`No ${state} jobs in ${q.name}`)
  }
  return jobs
}

// For use in the worker
// TODO - insert this into the maintanence queue on startup just like
//        checking db clusters status
export class CleanupWorkerQueueOperation extends BaseOperation<
  OpsCtx,
  undefined,
  boolean
> {
  async run() {
    return await cleanupWorkerQueue(this.ctx.em, this.ctx.log)
  }
}
