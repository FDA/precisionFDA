import { createQueues, logQueueStatus } from '@shared/queue'
import { QueueProxy } from '@shared/queue/queue.proxy'

// starts all the queues, defined in shared, attaches the handlers
const setupHandlers = async (provider: QueueProxy): Promise<void> => {
  await createQueues(provider)
  await logQueueStatus()
}

export { setupHandlers }
