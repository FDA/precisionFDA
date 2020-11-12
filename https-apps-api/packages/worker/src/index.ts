import { config, database } from '@pfda/https-apps-shared'
import { start } from './queues'
import { log } from './utils'

// PRODUCER - add to queue will be called from the operations
// connects the API and the worker
// figure out how to do it in SHARED context

Promise.resolve()
  .then(async () => {
    // todo: better signals handling as in the API
    // await database.start()
    // this is blocking, no other promise is resolved
    await start()
  })
  .catch(err => {
    log.error({ err }, 'failed to start the queue')
    throw err
  })
