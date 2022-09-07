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
import { clearOrphanedRepeatableJobs, getJobStatusMessage } from './queue.utils'
import * as types from './task.input'

let statusQueue: Bull.Queue
let fileSyncQueue: Bull.Queue
let emailsQueue: Bull.Queue
let maintenanceQueue: Bull.Queue

const getStatusQueue = (): Bull.Queue => statusQueue
const getFileSyncQueue = (): Bull.Queue => fileSyncQueue
const getEmailsQueue = (): Bull.Queue => emailsQueue
const getMaintenanceQueue = (): Bull.Queue => maintenanceQueue

const getQueues = (): Bull.Queue[] => [statusQueue, fileSyncQueue, emailsQueue, maintenanceQueue]

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

  statusQueue = new Bull(config.workerJobs.queues.default.name, config.redis.url, {
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
      removeOnFail: false,
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
  await statusQueue.isReady()
  await fileSyncQueue.isReady()
  await emailsQueue.isReady()
  await maintenanceQueue.isReady()
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  await initMaintenanceQueue()

  const removedJobs = await clearOrphanedRepeatableJobs(statusQueue)
  log.info({ removedJobs }, 'createQueues: Removed orphaned repeatable jobs.')
}

const initMaintenanceQueue = async () => {
  log.info({}, 'Initializing maintenance queue')
  if (config.shouldAddCheckNonterminatedClustersOnInit) {
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
  await statusQueue.close(true)
  await fileSyncQueue.close(true)
  await emailsQueue.close(true)
  await maintenanceQueue.close(true)
  log.info('Queues disconnected')
}

const addToQueue = async <T extends types.Task>(
  task: T,
  queue: Bull.Queue,
  options?: JobOptions,
  payloadFn?: (payload: AnyObject) => AnyObject,
) => {
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
        id: options.jobId,
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
  if (typeof statusQueue === 'undefined') {
    throw new Error('The queue was not started')
  }
  log.info({ jobId: job.id }, 'trying to remove repeatable job id')
  // this does not work because we need to remove the next scheduled job
  const [prefix, id] = job.id.toString().split(':')
  await statusQueue.removeJobs(`${prefix}:${id}:*`)
}

const removeRepeatableJob = async (job: JobInformation, queue: Queue) => {
  log.info({ jobId: job.id, cron: job.cron },
    'removeRepeatableJob: trying to remove repeatable job',
  )
  // await statusQueue.removeRepeatableByKey(job.key)
  await queue.removeRepeatable({ jobId: job.id, cron: job.cron })
}

const findRepeatable = async (bullJobId: string) => {
  const repeatableJobs = await statusQueue.getRepeatableJobs()
  const result = repeatableJobs.find(j => j.id === bullJobId)
  return result
}

// TASK PRODUCERS

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
  return await addToQueue(wrapped, statusQueue, options)
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
    let errorMessage = await getJobStatusMessage(existingJob, 'File sync')
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
    payload: undefined,
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
    payload: undefined,
    user,
  }
  const options: JobOptions = { jobId: types.TASK_TYPE.SYNC_SPACES_PERMISSIONS }
  return await addToQueue(wrapped, maintenanceQueue, options)
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
    repeat: { cron: config.workerJobs.syncJob.repeatPattern },
  }

  return await addToQueue(wrapped, statusQueue, options)
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


export * as debug from './queue.debug'

export { CleanupWorkerQueueOperation } from './ops/cleanup-worker-queue'

export {
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
  getStatusQueue,
  getFileSyncQueue,
  getEmailsQueue,
  getMaintenanceQueue,
  getQueues,
  disconnectQueues,
  types,
  removeRepeatable,
  removeRepeatableJob,
  findRepeatable,
}
