import { getQueues } from "."


// Queue debugging functions
export const debugQueueJobs = async (): Promise<any> => {
  const queues = getQueues()
  const result = await Promise.all(queues.map(async (q) => {
    const jobs = await q.getJobs(['waiting', 'active', 'delayed', 'failed', 'completed'])
    return {
      name: q.name,
      jobs: jobs,
      jobCounts: await q.getJobCounts(),
      repeatableJobs: await q.getRepeatableJobs(),
    }
  }))
  return result
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
  }
  return results
}
