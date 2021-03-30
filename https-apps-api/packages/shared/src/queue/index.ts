import { nanoid } from 'nanoid'
import Bull, { Job, JobOptions, QueueOptions } from 'bull'
import { AnyObject, UserCtx } from '../types'
import { defaultLogger as log } from '../logger'
import { config } from '../config'
import { TASKS } from './task.enum'
import * as types from './task.input'

let statusQueue: Bull.Queue

const getQueue = (): Bull.Queue => statusQueue

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
    },
  })
  await statusQueue.isReady()
}

const disconnectQueues = async (): Promise<void> => {
  await statusQueue.close()
}

const addToQueue = async (task: AnyObject, options?: JobOptions): Promise<Job> => {
  if (typeof statusQueue === 'undefined') {
    throw new Error('The queue was not started')
  }
  log.info(
    {
      task: {
        type: task.type,
        payload: task.payload,
        userId: task.user?.id,
      },
      job: {
        id: options?.jobId,
      },
    },
    'adding a task to queue',
  )
  const job = await statusQueue.add(task, options)
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

const createJobSyncTask = async (
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
  const options: JobOptions = {
    jobId: nanoid(),
    repeat: { cron: config.workerJobs.syncJob.repeatPattern },
  }
  return await addToQueue(wrapped, options)
}

export {
  createJobSyncTask,
  TASKS,
  createQueues,
  getQueue,
  disconnectQueues,
  types,
  removeRepeatable,
}
