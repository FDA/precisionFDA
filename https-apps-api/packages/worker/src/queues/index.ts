import { myTestQueue } from '@pfda/https-apps-shared'
import { handler } from '../jobs'

// starts all the queues, defined in shared, attaches the handlers
const start = async (): Promise<void> => {
  return await myTestQueue.process(handler)
}

export { start }
