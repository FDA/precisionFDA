import { createBullBoard } from '@bull-board/api'
import { BullAdapter } from '@bull-board/api/bullAdapter'
import { ExpressAdapter } from '@bull-board/express'
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { config, queue as queueDomain } from '@shared'
import { log } from '../logger'

@Module({})
export class BullBoardModule implements NestModule {
  async configure(consumer: MiddlewareConsumer) {
    if (!config.bullBoardEnabled) {
      return
    }

    log.log('creating bull board')
    const serverAdapter = new ExpressAdapter()
    serverAdapter.setBasePath('/bull-board')
    try {
      await queueDomain.createQueues()
      const queues = queueDomain.getQueues()
      createBullBoard({
        queues: queues.map((queue) => {
          log.log(`adding queue: ${queue.name} to bull board`)
          return new BullAdapter(queue)
        }),
        serverAdapter,
        options: {
          uiConfig: {
            boardTitle: 'pFDA queues',
          },
        },
      })

      consumer.apply(serverAdapter.getRouter()).forRoutes('/bull-board')
      log.log('bull board created')
    } catch (e) {
      log.error(`bull board creation error ${e}`)
    }
  }
}
