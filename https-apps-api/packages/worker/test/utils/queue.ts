import { queue } from '@pfda/https-apps-shared'

// empty queue
const emptyDefaultQueue = async () => {
  const defaultQueue = queue.getQueue()
  await defaultQueue.empty()
}

export { emptyDefaultQueue }
