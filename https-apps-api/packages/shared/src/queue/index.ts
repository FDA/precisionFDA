import Bull, { Job } from 'bull'
import { AnyObject, UserCtx } from '../types'
import { config } from '../config'
import { TASKS } from './task.enum'
import * as types from './task.input'

let statusQueue: Bull.Queue

const getQueue = (): Bull.Queue => statusQueue

// set up the queues
const createQueues = () => {
  statusQueue = new Bull('todo-name', config.redis.url)
}

const disconnectQueues = async () => {
  await statusQueue.close()
}

const addToQueue = async task => {
  if (typeof statusQueue === 'undefined') {
    throw new Error('The queue was not started')
  }
  console.log('adding a task to queue', task)
  const job = await statusQueue.add(task)
  return job
}

// TASK PRODUCERS

const createJobSyncTask = async (data: AnyObject, user: UserCtx): Promise<Job> => {
  const wrapped = {
    type: TASKS.SYNC_JOB_STATUS,
    payload: data,
    user,
  }
  return await addToQueue(wrapped)
}

export { createJobSyncTask, TASKS, createQueues, getQueue, disconnectQueues, types }
