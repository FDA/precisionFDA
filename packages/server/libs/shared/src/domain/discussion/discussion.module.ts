import { Module } from '@nestjs/common'
import { DiscussionService } from '@shared/domain/discussion/services/discussion.service'
import { PublisherService } from '@shared/domain/discussion/services/publisher.service'
import { EmailModule } from '@shared/domain/email/email.module'
import { EntityModule } from '@shared/domain/entity/entity.module'
import { SpaceModule } from '@shared/domain/space/space.module'
import { PlatformClientModule } from '@shared/platform-client/platform-client.module'
import { DiscussionQueueJobProducer } from './producer/discussion-queue-job.producer'
import { DiscussionNotificationService } from './services/discussion-notification.service'

@Module({
  imports: [PlatformClientModule, EntityModule, EmailModule, SpaceModule],
  providers: [
    PublisherService,
    DiscussionNotificationService,
    DiscussionService,
    DiscussionQueueJobProducer,
  ],
  exports: [DiscussionService, DiscussionQueueJobProducer, DiscussionNotificationService],
})
export class DiscussionModule {}
