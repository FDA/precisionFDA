/* eslint-disable import/group-exports */
import Bull from 'bull'
import { getQueues } from '.'


// Queue debugging functions
export const debugQueueJobs = async () => {
  const queues = getQueues()
  return Promise.all(queues.map(async (q) => {
    const jobs = await q.getJobs(['waiting', 'active', 'delayed', 'failed', 'completed'])
    return {
      name: q.name,
      jobs: jobs,
      jobCounts: await q.getJobCounts(),
      repeatableJobs: await q.getRepeatableJobs()
    }
  }))
}

export const debugQueueJob = async (jobId: string): Promise<any> => {
  const queues = getQueues()
  const results: any[] = []
  for (const q of queues) {
    const job = await q.getJob(jobId)
    if (job) {
      results.push({
        queue: q.name,
        job,
      })
    }

    const repeatableJobs = (await q.getRepeatableJobs()).filter(j => j.id === jobId)
    for (const repeatableJob of repeatableJobs) {
      results.push({
        queue: q.name,
        job: repeatableJob,
      })
    }
  }
  return results
}

export const removeJobs = async (pattern: string): Promise<any> => {
  const queues = getQueues()
  let jobsCountBefore = 0
  let jobsCountAfter = 0
  const aggregateCounts = (jobCounts: Bull.JobCounts): number => {
    return jobCounts.active + jobCounts.completed + jobCounts.delayed +
           jobCounts.failed + jobCounts.waiting
  }
  await Promise.all(queues.map(async (q) => {
    const beforeCount = aggregateCounts(await q.getJobCounts())
    jobsCountBefore += beforeCount
    await q.removeJobs(pattern)
    const afterCount = aggregateCounts(await q.getJobCounts())
    jobsCountAfter += afterCount
  }))
  return `${jobsCountBefore - jobsCountAfter} jobs removed`
}

export const removeRepeatableDebug = async (key: string): Promise<any> => {
  const queues = getQueues()
  let jobsCountBefore = 0
  let jobsCountAfter = 0
  await Promise.all(queues.map(async (q) => {
    const beforeCount = (await q.getRepeatableJobs()).length
    jobsCountBefore += beforeCount
    await q.removeRepeatableByKey(key)
    const afterCount = (await q.getRepeatableJobs()).length
    jobsCountAfter += afterCount
  }))
  return `${jobsCountBefore - jobsCountAfter} jobs removed`
}

