import { queue } from '@shared'
import { QueueProxy } from '@shared/queue/queue.proxy'

// starts all the queues, defined in shared, attaches the handlers
const setupHandlers = async (provider: QueueProxy): Promise<void> => {
  await queue.createQueues(provider)
  await queue.logQueueStatus()
}

export { setupHandlers }
