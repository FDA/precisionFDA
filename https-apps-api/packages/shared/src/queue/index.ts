import { nanoid } from 'nanoid'
import Bull, { Job, JobOptions, QueueOptions } from 'bull'
import { AnyObject, UserCtx } from '../types'
import { defaultLogger as log } from '../logger'
import { config } from '../config'
import { TASKS } from './task.enum'
import * as types from './task.input'
import { getJobStatusMessage } from './queue.utils'
import { InvalidStateError } from '../errors'
import { SyncJobOperation } from '../domain/job'
import { formatDuration } from '../domain/job/job.helper'

let statusQueue: Bull.Queue
let fileSyncQueue: Bull.Queue
let emailsQueue: Bull.Queue
let maintenanceQueue: Bull.Queue

const getQueue = (): Bull.Queue => statusQueue

const getQueues = (): Bull.Queue[] => [statusQueue, fileSyncQueue, emailsQueue, maintenanceQueue]

// set up the queues
const createQueues = async (): Promise<void> => {
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
}

const disconnectQueues = async (): Promise<void> => {
  log.info('Disconnecting queues')
  await statusQueue.close(true)
  await fileSyncQueue.close(true)
  await emailsQueue.close(true)
  await maintenanceQueue.close(true)
  log.info('Queues disconnected')
}

const addToQueue = async (
  task: AnyObject,
  queue: Bull.Queue,
  options?: JobOptions,
  payloadFn?: (payload: AnyObject) => AnyObject,
): Promise<Job> => {
  if (typeof queue === 'undefined') {
    throw new Error('The queue was not started')
  }
  // default noop function
  const whitelistPayloadFn = payloadFn ? payloadFn : payload => payload
  log.info(
    {
      task: {
        type: task.type,
        payload: whitelistPayloadFn(task.payload),
        userId: task.user?.id,
      },
      job: {
        id: options?.jobId,
      },
    },
    'adding a task to queue',
  )
  const job = await queue.add(task, options)
  return job
}

const removeRepeatable = async (job: Job): Promise<void> => {
  if (typeof statusQueue === 'undefined') {
    throw new Error('The queue was not started')
  }
  log.info({ jobId: job.id }, 'trying to remove repeatable job id')
  // this does not work because we need to remove the next scheduled job
  const [prefix, id] = job.id.toString().split(':')
  await statusQueue.removeJobs(`${prefix}:${id}:*`)
}

// TASK PRODUCERS

const createSyncJobStatusTask = async (
  data: types.CheckStatusJob['payload'],
  user: UserCtx,
): Promise<Job> => {
  const wrapped = {
    type: TASKS.SYNC_JOB_STATUS,
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
): Promise<Job> => {
  const jobType = TASKS.SYNC_WORKSTATION_FILES
  const wrapped = {
    type: jobType,
    payload: data,
    user,
  }

  const jobId = `${jobType}.${data.dxid}`
  const existingJob = await fileSyncQueue.getJob(jobId)
  if (existingJob) {
    // Do not allow a second file sync job to be added to the queue
    let errorMessage = getJobStatusMessage(existingJob, 'File sync')
    const elapsedTime = Date.now() - existingJob.timestamp
    errorMessage += `. Current state is ${await existingJob.getState()}`
    errorMessage += `. Elapsed time ${formatDuration(elapsedTime)}`
    throw new InvalidStateError(errorMessage)
  }

  // This is a user triggered task, and should not be repeated
  const options: JobOptions = {
    jobId: jobId,
  }
  return await addToQueue(wrapped, fileSyncQueue, options)
}

// Specifying a taskId will prevent multiple emails of that
// type and id to be sent
const createSendEmailTask = async (
  data: types.SendEmailJob['payload'],
  user: UserCtx,
  taskId?: string,
): Promise<Job> => {
  const wrapped = {
    type: TASKS.SEND_EMAIL,
    payload: data,
    user,
  }
  const options: JobOptions = {
    jobId: nanoid(),
  }
  const handlePayloadFn = (
    payload: types.SendEmailJob['payload'],
  ): types.SendEmailJob['payload'] => ({
    ...payload,
    body: '[too-long]',
  })
  return await addToQueue(wrapped, emailsQueue, options, handlePayloadFn)
}

const removeFromEmailQueue = (jobId: string) => {
  emailsQueue.removeJobs(jobId)
}

const createCheckStaleJobsTask = async (data: types.CheckStaleJobsJob['payload']): Promise<Job> => {
  const wrapped = {
    type: TASKS.CHECK_STALE_JOBS,
    payload: data,
  }
  const options: JobOptions = { jobId: `${TASKS.CHECK_STALE_JOBS}` }
  return await addToQueue(wrapped, maintenanceQueue, options)
}

const createDbClusterSyncTask = async (
  data: types.SyncDbClusterJob['payload'],
  user: UserCtx,
): Promise<Job> => {
  const wrapped = {
    type: TASKS.SYNC_DBCLUSTER_STATUS,
    payload: data,
    user,
  }

  const options: JobOptions = {
    jobId: nanoid(),
    repeat: { cron: config.workerJobs.syncJob.repeatPattern },
  }

  return await addToQueue(wrapped, statusQueue, options)
}

export * as debug from './queue.debug'

export {
  createSyncJobStatusTask,
  createSyncWorkstationFilesTask,
  createSendEmailTask,
  removeFromEmailQueue,
  createCheckStaleJobsTask,
  createDbClusterSyncTask,
  TASKS,
  createQueues,
  getQueue,
  getQueues,
  disconnectQueues,
  types,
  removeRepeatable,
}
