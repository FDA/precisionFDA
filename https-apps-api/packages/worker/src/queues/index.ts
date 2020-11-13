import { queue } from '@pfda/https-apps-shared'
import { handler } from '../jobs'

// starts all the queues, defined in shared, attaches the handlers
const setupHandlers = async (): Promise<void> => {
  queue.createQueues()
  await queue.getQueue().process(handler)
}

export { setupHandlers }
