import { queue, config } from '@pfda/https-apps-shared'
import { handler } from '../jobs'
import { log } from '../utils'

// starts all the queues, defined in shared, attaches the handlers
const setupHandlers = async (): Promise<void> => {
  await queue.createQueues()
  log.info(
    { queueStatus: queue.getQueue().client.status },
    `${config.workerJobs.queues.default.name} status`,
  )
  await queue.getQueue().process(handler)
}

export { setupHandlers }
