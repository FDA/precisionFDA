import { queue, config } from '@pfda/https-apps-shared'
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
  await Promise.all(queue.getQueues().map(async q => q.process(handler)))
}

export { setupHandlers }
