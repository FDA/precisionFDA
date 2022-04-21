import Bull from 'bull'
import { getQueues } from "."


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
        job: job,
      })
    }

    const repeatableJobs = (await q.getRepeatableJobs()).filter(job => job.id === jobId)
    for (const job of repeatableJobs) {
      results.push({
        queue: q.name,
        job: job,
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
    jobsCountBefore += aggregateCounts(await q.getJobCounts())
    q.removeJobs(pattern)
    jobsCountAfter += aggregateCounts(await q.getJobCounts())
  }))
  return `${jobsCountBefore-jobsCountAfter} jobs removed`
}

export const removeRepeatable = async (key: string): Promise<any> => {
  const queues = getQueues()
  let jobsCountBefore = 0
  let jobsCountAfter = 0
  await Promise.all(queues.map(async (q) => {
    jobsCountBefore += (await q.getRepeatableJobs()).length
    q.removeRepeatableByKey(key)
    jobsCountAfter += (await q.getRepeatableJobs()).length
  }))
  return `${jobsCountAfter-jobsCountBefore} jobs removed`
}
