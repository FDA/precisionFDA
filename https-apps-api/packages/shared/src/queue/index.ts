import { nanoid } from 'nanoid'
import Bull, { Job, JobOptions, QueueOptions } from 'bull'
import { AnyObject, UserCtx } from '../types'
import { defaultLogger as log } from '../logger'
import { config } from '../config'
import { TASKS } from './task.enum'
import * as types from './task.input'

let statusQueue: Bull.Queue
let emailsQueue: Bull.Queue

const getQueue = (): Bull.Queue => statusQueue

const getQueues = (): Bull.Queue[] => [statusQueue, emailsQueue]

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
  emailsQueue = new Bull(config.workerJobs.queues.emails.name, config.redis.url, {
    redis: redisOptions,
    defaultJobOptions: {
      removeOnComplete: true,
      removeOnFail: false,
    },
  })
  await statusQueue.isReady()
  await emailsQueue.isReady()
}

const disconnectQueues = async (): Promise<void> => {
  await statusQueue.close()
  await emailsQueue.close()
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
  return await addToQueue(wrapped, statusQueue, options)
}

const createSendEmailTask = async (
  data: types.SendEmailJob['payload'],
  user: UserCtx,
): Promise<Job> => {
  const wrapped = {
    type: TASKS.SEND_EMAIL,
    payload: data,
    user,
  }
  const options: JobOptions = {}
  const handlePayloadFn = (
    payload: types.SendEmailJob['payload'],
  ): types.SendEmailJob['payload'] => ({
    ...payload,
    body: '[too-long]',
  })
  return await addToQueue(wrapped, emailsQueue, options, handlePayloadFn)
}

export {
  createJobSyncTask,
  createSendEmailTask,
  TASKS,
  createQueues,
  getQueue,
  getQueues,
  disconnectQueues,
  types,
  removeRepeatable,
}
