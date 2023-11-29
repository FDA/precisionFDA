import { queue } from '@shared'

// empty queue
const emptyDefaultQueue = async () => {
  const defaultQueue = queue.getMainQueue()
  await defaultQueue.empty()
}

export { emptyDefaultQueue }
