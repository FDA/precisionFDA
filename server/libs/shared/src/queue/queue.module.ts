import { BullModule } from '@nestjs/bull'
import { Global, Module } from '@nestjs/common'
import { config } from '@shared/config'
import { EmailModule } from '@shared/domain/email/email.module'
import { SpaceReportModule } from '@shared/domain/space-report/space-report.module'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'
import { QueueEventListener } from '@shared/queue/queue.event.listener'
import { QueueProxy } from '@shared/queue/queue.proxy'
import { QueueOptions } from 'bull'

const redisOptions: QueueOptions['redis'] = {
  tls: config.redis.isSecure as any,
}
if (config.redis.isSecure) {
  redisOptions.password = config.redis.authPassword
  redisOptions.connectTimeout = config.redis.connectTimeout
}

@Global()
@Module({
  imports: [
    BullModule.forRoot({
      url: config.redis.url,
      redis: redisOptions,
    }),
    BullModule.registerQueue({
      name: config.workerJobs.queues.default.name,
      defaultJobOptions: {
        // if set to false, it will eventually eat up space in the redis instance
        removeOnComplete: true,
        removeOnFail: true,
        priority: 3,
      },
    }),
    BullModule.registerQueue({
      name: config.workerJobs.queues.maintenance.name,
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: true,
        priority: 10,
      },
    }),
    SpaceReportModule,
    EmailModule,
    UserFileModule,
  ],
  providers: [QueueProxy, QueueEventListener],
  exports: [BullModule],
})
export class QueueModule {}
