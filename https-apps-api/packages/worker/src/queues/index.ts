import { queue } from '@pfda/https-apps-shared'
import { handler } from '../jobs'

// starts all the queues, defined in shared, attaches the handlers
const setupHandlers = async (): Promise<void> => {
  queue.createQueues()
  // eslint-disable-next-line @typescript-eslint/return-await, require-await, id-length
  await Promise.all(queue.getQueues().map(async q => q.process(handler)))
}

export { setupHandlers }
