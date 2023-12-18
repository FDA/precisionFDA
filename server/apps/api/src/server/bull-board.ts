import { createBullBoard } from '@bull-board/api'
import { BullAdapter } from '@bull-board/api/bullAdapter'
import { KoaAdapter } from '@bull-board/koa'
import { queue as queueDomain } from '@shared'
import type Koa from 'koa'
import { log } from '../logger'

export const startBullBoard = async (app: Koa<Koa.DefaultState, Api.Ctx>) => {
  log.info('creating bull board')
  const serverAdapter = new KoaAdapter()
  serverAdapter.setBasePath('/bull-board')
  try {
    await queueDomain.createQueues()
    const queues = queueDomain.getQueues()
    createBullBoard({
      queues: queues.map(queue => {
        log.info(`adding queue: ${queue.name} to bull board`)
        return new BullAdapter(queue)
      }),
      serverAdapter,
      options: {
        uiConfig: {
          boardTitle: 'pFDA queues',
        },
      },
    })
    app.use(serverAdapter.registerPlugin())
    log.info('bull board created')
  } catch (e) {
    log.error(`bull board creation error ${e}`)
  }
}
