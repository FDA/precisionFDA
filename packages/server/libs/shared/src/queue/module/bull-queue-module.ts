import { BullAdapter } from '@bull-board/api/bullAdapter'
import { ExpressAdapter } from '@bull-board/express'
import { BullBoardModule } from '@bull-board/nestjs'
import { BullBoardModule as BullBoardFeatureModule } from '@bull-board/nestjs/dist/bull-board.module'
import { BullModule } from '@nestjs/bull'
import { BullModuleOptions } from '@nestjs/bull/dist/interfaces/bull-module-options.interface'
import { DynamicModule } from '@nestjs/common'
import { config } from '@shared/config'
import { QueueOptions } from 'bull'

export class BullQueueModule {
  static forRoot(): DynamicModule {
    const redisOptions: QueueOptions['redis'] = {
      tls: config.redis.isSecure as any,
    }
    if (config.redis.isSecure) {
      redisOptions.password = config.redis.authPassword
      redisOptions.connectTimeout = config.redis.connectTimeout
    }

    const imports = [
      BullModule.forRoot({
        url: config.redis.url,
        redis: redisOptions,
        ...config.defaultJobOptions,
      }),
    ]

    if (config.bullBoardEnabled) {
      imports.push(
        BullBoardFeatureModule.forRoot({
          route: '/bull-board',
          adapter: ExpressAdapter,
          boardOptions: {
            uiConfig: {
              boardTitle: 'pFDA queues',
            },
          },
        }),
      )
    }

    return {
      module: BullQueueModule,
      imports,
      exports: [BullModule],
    }
  }

  static registerQueue(opts: BullModuleOptions): DynamicModule {

    const imports = [
      BullModule.registerQueue({
        ...opts,
        defaultJobOptions: {
          ...config.defaultJobOptions,
          ...opts.defaultJobOptions,
        },
      }),
    ]

    if (config.bullBoardEnabled) {
      imports.push(
        BullBoardModule.forFeature({
          name: opts.name,
          adapter: BullAdapter,
        }),
      )
    }

    return {
      module: BullQueueModule,
      imports,
      exports: [BullModule],
    }
  }
}
