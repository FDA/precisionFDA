import { WorkerBaseOperation, BaseOperation } from "../../utils/base-operation"
import { queue } from "../.."
import { OpsCtx } from "../../types"
import { Job } from '../../domain/job/job.entity'
import { isStateTerminal } from "../../domain/job/job.helper"
import { isNil } from 'ramda'
import { TASK_TYPE } from '../task.input'
import { SyncJobOperation } from "../../domain/job"
import { clearFailedJobs } from "../queue.utils"
import { Logger } from "pino"

// Clean up the bull queue
export const cleanupWorkerQueue = async (em: any, log: Logger): Promise<any> => {
  const now = Date.now()

  // Cleanup sync_job_status tasks whose job has already been terminated
  //
  // This also cleans up job sync tasks created before we assigned unique IDs
  //
  log.info('CleanupWorkerQueueOperation: Cleaning up status queue')
  const statusQueue = queue.getStatusQueue()
  const repeatableJobs = await statusQueue.getRepeatableJobs()

  const jobRepo = em.getRepository(Job)
  const removedRepeatableJobs: any[] = []
  const possiblyExpiredJobs: any[] = []
  for (const job of repeatableJobs) {
    const timeSinceNext = now - job.next
    const hoursSinceNext = timeSinceNext / (60*60*1000)

    if (job.id?.startsWith(TASK_TYPE.SYNC_JOB_STATUS)) {
      const jobDxid = SyncJobOperation.getJobDxidFromBullJobId(job.id)
      log.info({ jobDxid, job }, 'CleanupWorkerQueueOperation: Considering job sync task')
      const jobFromDb: Job = await jobRepo.findOne({ dxid: jobDxid })
      if (isNil(jobFromDb)) {
        log.info({
          jobDxid,
          hoursSinceNext,
        }, 'CleanupWorkerQueueOperation: Removing job sync task because job does not exist in the db')
        removedRepeatableJobs.push({
          id: job.id,
          key: job.key,
          hoursSinceNext,
        })
        statusQueue.removeRepeatableByKey(job.key)
      }
      else if (isStateTerminal(jobFromDb.state)) {
        // Removing job sync if the job has terminated
        log.info({
          jobDxid,
          jobState: jobFromDb.state,
          hoursSinceNext,
        }, 'CleanupWorkerQueueOperation: Removing job sync task because job has terminated')
        removedRepeatableJobs.push({
          id: job.id,
          key: job.key,
          hoursSinceNext,
        })
        statusQueue.removeRepeatableByKey(job.key)
      }
    }
    else {
      log.info({ job, hoursSinceNext }, 'CleanupWorkerQueueOperation: Inspecing unhandled repeatable job')
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
      // statusQueue.removeRepeatableByKey(job.key)
    }
  }
  log.info({ removedRepeatableJobs }, 'CleanupWorkerQueueOperation: Removed orphaned repeatable jobs')

  const failedStatusJobs = await clearFailedJobs(statusQueue, log)

  // Cleanup file sync queue
  //
  // Some observed cases where jobs have failed:
  //   "failedReason": "job stalled more than allowable limit"
  //
  const fileSyncQueue = queue.getFileSyncQueue()
  const failedFileSyncJobs = await clearFailedJobs(fileSyncQueue, log)

  // Cleanup sent emails
  //
  // On staging/prod there were a lot of failed email tasks lingering around
  //
  log.info('CleanupWorkerQueueOperation: Cleaning up email queue')
  const emailQueue = queue.getEmailsQueue()
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
    log.info({ jobs }, `CleanupWorkerQueueOperation: Removing ${state} jobs from ${q.name}`)
    q.clean(0, state);
    log.info({ count }, `CleanupWorkerQueueOperation: Removed ${count} ${state} jobs from ${q.name}`)
  }
  else {
    log.info(`CleanupWorkerQueueOperation: No ${state} jobs in ${q.name}`)
  }
  return jobs
}

const clearCompletedJobs = async (q: any, log: any): Promise<any> => {
  return clearJobs(q, 'completed', log)
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
