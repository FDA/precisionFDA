import { createBullBoard } from '@bull-board/api'
import { BullAdapter } from '@bull-board/api/bullAdapter'
import { ExpressAdapter } from '@bull-board/express'
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { config } from '@shared/config'
import { getQueues } from '@shared/queue'
import { log } from '../logger'

@Module({})
export class BullBoardModule implements NestModule {
  async configure(consumer: MiddlewareConsumer) {
    if (!config.bullBoardEnabled) {
      return
    }

    log.verbose('creating bull board')
    const serverAdapter = new ExpressAdapter()
    serverAdapter.setBasePath('/bull-board')
    try {
      const queues = getQueues()
      createBullBoard({
        queues: queues.map((queue) => {
          log.verbose(`adding queue: ${queue.name} to bull board`)
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
      log.verbose('bull board created')
    } catch (e) {
      log.error(`bull board creation error ${e}`)
    }
  }
}
