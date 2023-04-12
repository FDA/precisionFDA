/* eslint-disable no-warning-comments */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable require-await */
/* eslint-disable multiline-ternary */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import Bull, { Job, JobInformation, JobOptions, Queue, QueueOptions } from 'bull'
import { AnyObject, UserCtx } from '../types'
import { defaultLogger as log } from '../logger'
import { config } from '../config'
import { InvalidStateError } from '../errors'
import { SyncJobOperation } from '../domain/job'
import { formatDuration } from '../domain/job/job.helper'
import { EmailSendOperation } from '../domain/email'
import { SyncDbClusterOperation } from '../domain/db-cluster'
import { SyncFilesStateOperation } from '../domain/user-file'
import * as utils from './queue.utils'
import * as types from './task.input'

let mainQueue: Bull.Queue
let fileSyncQueue: Bull.Queue
let emailsQueue: Bull.Queue
let maintenanceQueue: Bull.Queue

const getMainQueue = (): Bull.Queue => mainQueue
const getFileSyncQueue = (): Bull.Queue => fileSyncQueue
const getEmailsQueue = (): Bull.Queue => emailsQueue
const getMaintenanceQueue = (): Bull.Queue => maintenanceQueue

const getQueues = (): Bull.Queue[] => [mainQueue, fileSyncQueue, emailsQueue, maintenanceQueue]

const clearOrphanedRepeatableJobs = async (q: Queue): Promise<Bull.JobInformation[]> => {
  return await utils.clearOrphanedRepeatableJobs(q)
}

// set up the queues
const createQueues = async (): Promise<void> => {
  log.info({}, 'Initializing queues')

  // other config passed into IORedis constructor
  const redisOptions: QueueOptions['redis'] = {
    tls: config.redis.isSecure as any,
  }
  if (config.redis.isSecure) {
    redisOptions.password = config.redis.authPassword
    redisOptions.connectTimeout = config.redis.connectTimeout
  }

  mainQueue = new Bull(config.workerJobs.queues.default.name, config.redis.url, {
    redis: redisOptions,
    defaultJobOptions: {
      // if set to false, it will eventually eat up space in the redis instance
      removeOnComplete: true,
      removeOnFail: true,
      priority: 3,
    },
  })

  emailsQueue = new Bull(config.workerJobs.queues.emails.name, config.redis.url, {
    redis: redisOptions,
    defaultJobOptions: {
      removeOnComplete: true,
      removeOnFail: true,
      attempts: 3, // Re-try sending the email a few times in case of network issue
      backoff: 5 * 60 * 1000, // 5 min delay between retries
      priority: 5,
    },
  })

  fileSyncQueue = new Bull(config.workerJobs.queues.fileSync.name, config.redis.url, {
    redis: redisOptions,
    defaultJobOptions: {
      // if set to false, it will eventually eat up space in the redis instance
      removeOnComplete: true,
      removeOnFail: true,
      priority: 7,
    },
  })

  maintenanceQueue = new Bull(config.workerJobs.queues.maintenance.name, config.redis.url, {
    redis: redisOptions,
    defaultJobOptions: {
      removeOnComplete: true,
      removeOnFail: true,
      priority: 10,
    },
  })
  await mainQueue.isReady()
  await fileSyncQueue.isReady()
  await emailsQueue.isReady()
  await maintenanceQueue.isReady()
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  await initMaintenanceQueue()

  const removedJobs = clearOrphanedRepeatableJobs(mainQueue)
  log.info({ removedJobs }, 'createQueues: Removed orphaned repeatable jobs.')
}

const initMaintenanceQueue = async () => {
  log.info({}, 'Initializing maintenance queue')
  if (config.workerJobs.queues.maintenance.onInit.shouldAddCheckNonterminatedClusters) {
    const checkNonTerminatedDbclustersTask = {
      type: types.TASK_TYPE.CHECK_NON_TERMINATED_DBCLUSTERS as const,
    }
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    await addToQueue(checkNonTerminatedDbclustersTask, maintenanceQueue, {
      repeat: {
        cron: config.workerJobs.nonTerminatedDbClusters.repeatPattern,
      },
      jobId: types.TASK_TYPE.CHECK_NON_TERMINATED_DBCLUSTERS,
    })
  }
}

const disconnectQueues = async (): Promise<void> => {
  log.info('Disconnecting queues')
  await mainQueue.close(true)
  await fileSyncQueue.close(true)
  await emailsQueue.close(true)
  await maintenanceQueue.close(true)
  log.info('Queues disconnected')
}

const addToQueue = async <T extends types.Task>(
  task: T,
  queue: Bull.Queue,
  options?: JobOptions,
  payloadFn?: (payload: any) => any,
): Promise<Job<T>> => {
  if (typeof queue === 'undefined') {
    throw new Error('The queue was not started')
  }
  // default noop function
  const whitelistPayloadFn = payloadFn || (payload => payload)
  log.info(
    {
      task: {
        type: task.type,
        // TODO(samuel) fix
        payload: whitelistPayloadFn((task as any).payload),
        userId: (task as any)?.user?.id,
      },
      job: {
        id: options?.jobId,
      },
    },
    'adding a task to queue',
  )
  // TODO(samuel) fix - idk why type resolution doesn't work
  const job = await queue.add(task, options) as Bull.Job<T>
  return job
}

// removeRepeatable and removeRepeatableJob explanation:
//     removeRepeatable calls calls queue.removeJobs, removing the job task
//     removeRepeatableJob calls queue.removeRepeatable, removing the entity with 'cron'
// Hypothesis: if we remove the repetableJob (the entity with 'cron') alongside the job as is currently done
//             when a sync task such as SyncJobOperation finishes, it may be the most correct way of cleaning
//             up repeatable jobs
// TODO: dig deeper into bull queue's implementation to verify the above
const removeRepeatable = async (job: Job) => {
  if (typeof mainQueue === 'undefined') {
    throw new Error('The queue was not started')
  }
  log.info({ jobId: job.id }, 'trying to remove repeatable job id')
  // this does not work because we need to remove the next scheduled job
  const [prefix, id] = job.id.toString().split(':')
  await mainQueue.removeJobs(`${prefix}:${id}:*`)
}

const removeRepeatableJob = async (job: JobInformation, queue: Queue) => {
  log.info(
    { jobId: job.id, cron: job.cron },
    'removeRepeatableJob: trying to remove repeatable job',
  )
  // await mainQueue.removeRepeatableByKey(job.key)
  await queue.removeRepeatable({ jobId: job.id, cron: job.cron })
}

const findRepeatable = async (bullJobId: string) => {
  const repeatableJobs = await mainQueue.getRepeatableJobs()
  const result = repeatableJobs.find(j => j.id === bullJobId)
  return result
}


// TASK PRODUCERS

const createSyncFilesStateTask = async (
  user: UserCtx,
) => {
  log.info(
    { userId: user.id },
    'Creating SyncFilesStateTask',
  )

  const task = {
    type: types.TASK_TYPE.SYNC_FILES_STATE as const,
    user,
  }

  const options: JobOptions = {
    // There should only be one sync files state task per user
    jobId: SyncFilesStateOperation.getBullJobId(user.dxuser),
    repeat: { cron: config.workerJobs.syncFiles.repeatPattern },
  }
  return await addToQueue(task, mainQueue, options)
}

const createSyncJobStatusTask = async (
  data: types.CheckStatusJob['payload'],
  user: UserCtx,
) => {
  const wrapped = {
    type: types.TASK_TYPE.SYNC_JOB_STATUS as const,
    payload: data,
    user,
  }
  // unique jobId ensures that every createTask call actually creates a new repeatable job
  // even with the same payload! -> have to clean up the queue correctly

  // We should prevent new sync jobs to be added
  //
  // If we use the dxid of the job as the Bull jobID, it would prevent repeated queueing but
  // it prevents future addition of this job after syncing has stopped.

  const options: JobOptions = {
    // There should only be one sync job task
    jobId: SyncJobOperation.getBullJobId(data.dxid),
    repeat: { cron: config.workerJobs.syncJob.repeatPattern },
  }
  return await addToQueue(wrapped, mainQueue, options)
}

const createSyncWorkstationFilesTask = async (
  data: types.CheckStatusJob['payload'],
  user: UserCtx,
) => {
  const jobType = types.TASK_TYPE.SYNC_WORKSTATION_FILES as const
  const wrapped = {
    type: jobType,
    payload: data,
    user,
  }

  const jobId = `${jobType}.${data.dxid}`
  const existingJob = await fileSyncQueue.getJob(jobId)
  if (existingJob !== null) {
    // Do not allow a second file sync job to be added to the queue
    let errorMessage = await utils.getJobStatusMessage(existingJob, 'File sync')
    const elapsedTime = Date.now() - existingJob.timestamp
    errorMessage += `. Current state is ${await existingJob.getState()}`
    errorMessage += `. Elapsed time ${formatDuration(elapsedTime)}`
    throw new InvalidStateError(errorMessage)
  }

  // This is a user triggered task, and should not be repeated
  const options: JobOptions = {
    jobId,
  }
  return await addToQueue(wrapped, fileSyncQueue, options)
}

// Specifying a taskId will prevent multiple emails of that
// type and id to be sent
const createSendEmailTask = async (
  data: types.SendEmailJob['payload'],
  user: UserCtx | undefined,
  taskId?: string,
) => {
  const wrapped = {
    type: types.TASK_TYPE.SEND_EMAIL as const,
    payload: data,
    user,
  }
  const options: JobOptions = taskId ? {
    jobId: taskId,
    // The following is important for emails that should not be repeated
    removeOnComplete: false,
    removeOnFail: true,
  } : {
    jobId: EmailSendOperation.getBullJobId(data.emailType),
  }
  const handlePayloadFn = (payload: types.SendEmailJob['payload']): types.SendEmailJob['payload'] => ({
    ...payload,
    body: '[too-long]',
  })
  return addToQueue(wrapped, emailsQueue, options, handlePayloadFn)
}

const removeFromEmailQueue = (jobId: string) => {
  emailsQueue.removeJobs(jobId)
}

const createCheckStaleJobsTask = async (
  user: UserCtx,
) => {
  const wrapped = {
    type: types.TASK_TYPE.CHECK_STALE_JOBS as const,
    payload: undefined as any,
    user,
  }
  const options: JobOptions = { jobId: types.TASK_TYPE.CHECK_STALE_JOBS }
  return await addToQueue(wrapped, maintenanceQueue, options)
}

const createSyncSpacesPermissionsTask = async (
  user: UserCtx,
) => {
  const wrapped = {
    type: types.TASK_TYPE.SYNC_SPACES_PERMISSIONS as const,
    payload: undefined as any,
    user,
  }
  const options: JobOptions = { jobId: types.TASK_TYPE.SYNC_SPACES_PERMISSIONS }
  return await addToQueue(wrapped, maintenanceQueue, options)
}

const createRemoveNodesJobTask = async (ids: number[], user: UserCtx) => {
  const wrapped = {
    type: types.TASK_TYPE.REMOVE_NODES as const,
    payload: ids,
    user,
  }
  const options: JobOptions = {
    jobId: `${wrapped.type}.${user.dxuser}-${new Date().valueOf().toString()}`,
  }
  return await addToQueue(wrapped, fileSyncQueue, options)
}

const createDbClusterSyncTask = async (
  data: types.SyncDbClusterJob['payload'],
  user: UserCtx,
) => {
  const wrapped = {
    type: types.TASK_TYPE.SYNC_DBCLUSTER_STATUS as const,
    payload: data,
    user,
  }

  const options: JobOptions = {
    jobId: SyncDbClusterOperation.getBullJobId(data.dxid),
    repeat: { cron: config.workerJobs.syncDbClusters.repeatPattern },
  }

  return await addToQueue(wrapped, mainQueue, options)
}

const createUserCheckupTask = async (data: types.BasicUserJob) => {
  const wrapped = {
    type: types.TASK_TYPE.USER_CHECKUP as const,
    user: data.user,
  }
  const options: JobOptions = { jobId: `${wrapped.type}.${data.user.dxuser}` }
  return await addToQueue(wrapped, maintenanceQueue, options)
}

const createCheckUserJobsTask = async (data: types.BasicUserJob) => {
  const wrapped = {
    type: types.TASK_TYPE.CHECK_USER_JOBS as const,
    user: data.user,
  }
  const options: JobOptions = { jobId: `${wrapped.type}.${data.user.dxuser}` }
  return await addToQueue(wrapped, maintenanceQueue, options)
}

const createTestMaxMemoryTask = async (): Promise<any> => {
  maintenanceQueue.removeJobs(types.TASK_TYPE.DEBUG_MAX_MEMORY)

  const data = {
    type: types.TASK_TYPE.DEBUG_MAX_MEMORY as const,
  }

  const options: JobOptions = {
    jobId: types.TASK_TYPE.DEBUG_MAX_MEMORY,
  }
  return await addToQueue(data, maintenanceQueue, options)
}

// Queue adding helpers
//
const addToQueueEnsureUnique = async <T extends types.Task>(
  q: Queue,
  task: T,
  jobId: string | undefined,
) => {
  // If jobId is provided, there should not be multiple items with this jobId in the queue
  if (jobId) {
    // Do not allow a second job to be added to the queue
    const existingJob = await q.getJob(jobId)
    if (existingJob) {
      let errorMessage = existingJob.hasOwnProperty('getState')
        ? await utils.getJobStatusMessageWithElapsedTime(existingJob, task.type)
        : `Job with id ${jobId} already exists in queue`
      throw new InvalidStateError(errorMessage)
    }
  }

  const options: JobOptions = {
    jobId,
  }
  return await addToQueue(task, q, options)
}

export * as debug from './queue.debug'

export { CleanupWorkerQueueOperation } from './ops/cleanup-worker-queue'

export {
  createSyncFilesStateTask,
  createSyncJobStatusTask,
  createSyncWorkstationFilesTask,
  createSendEmailTask,
  removeFromEmailQueue,
  createCheckStaleJobsTask,
  createSyncSpacesPermissionsTask,
  createDbClusterSyncTask,
  createUserCheckupTask,
  createCheckUserJobsTask,
  createTestMaxMemoryTask,
  createQueues,
  getMainQueue,
  createRemoveNodesJobTask,
  getFileSyncQueue,
  getEmailsQueue,
  getMaintenanceQueue,
  getQueues,
  disconnectQueues,
  types,
  utils,
  removeRepeatable,
  removeRepeatableJob,
  findRepeatable,
  addToQueueEnsureUnique,
  clearOrphanedRepeatableJobs,
}
