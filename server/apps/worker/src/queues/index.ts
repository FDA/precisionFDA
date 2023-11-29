import { queue } from '@shared'
import { handler } from '../jobs'
import { log } from '../utils'

// starts all the queues, defined in shared, attaches the handlers
const setupHandlers = async (): Promise<void> => {
  await queue.createQueues()

  await Promise.all(queue.getQueues().map(async q => {
    log.info(
      {
        queueStatus: q.client.status,
        currentJobCounts: await q.getJobCounts(),
        repeatableJobs: await q.getRepeatableJobs(),
      },
      `${q.name} status on startup`,
    )
  }))

  // TODO(samuel) - refactor all queues should have their own specific handlers
  // TODO(samuel) - no need for single switch case for all
  // eslint-disable-next-line @typescript-eslint/return-await, require-await, id-length
  await Promise.all(queue
    .getQueues()
    .map(async q => await q
      .process(async job => await handler(job)
        .catch(error => {
          log.error('Job handler failed', { job, error })
          throw error
        })))).catch(error => {
    log.error(error, 'Job queue failed')
  })
}

export { setupHandlers }
