import { Module } from '@nestjs/common'
import { DiscussionService } from '@shared/domain/discussion/services/discussion.service'
import { PublisherService } from '@shared/domain/discussion/services/publisher.service'
import { EmailModule } from '@shared/domain/email/email.module'
import { EntityModule } from '@shared/domain/entity/entity.module'
import { SpaceModule } from '@shared/domain/space/space.module'
import { PlatformClientModule } from '@shared/platform-client/platform-client.module'
import { DiscussionQueueJobProducer } from './producer/discussion-queue-job.producer'
import { DiscussionNotificationService } from './services/discussion-notification.service'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Discussion } from '@shared/domain/discussion/discussion.entity'

@Module({
  imports: [
    PlatformClientModule,
    EntityModule,
    EmailModule,
    SpaceModule,
    MikroOrmModule.forFeature([Discussion]),
  ],
  providers: [
    PublisherService,
    DiscussionNotificationService,
    DiscussionService,
    DiscussionQueueJobProducer,
  ],
  exports: [
    DiscussionService,
    DiscussionQueueJobProducer,
    DiscussionNotificationService,
    MikroOrmModule,
  ],
})
export class DiscussionModule {}
