// empty queue
import { getMainQueue } from '@shared/queue'

const emptyDefaultQueue = async () => {
  const defaultQueue = getMainQueue()
  await defaultQueue.empty()
}

export { emptyDefaultQueue }
