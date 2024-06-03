import { Module } from '@nestjs/common'
import { DiscussionService } from '@shared/domain/discussion/services/discussion.service'
import { PublisherService } from '@shared/domain/discussion/services/publisher.service'
import { EntityModule } from '@shared/domain/entity/entity.module'
import { PlatformClientModule } from '@shared/platform-client/platform-client.module'
import { EmailModule } from '../email/email.module'
import { DiscussionNotificationService } from './services/discussion-notification.service'

@Module({
  imports: [PlatformClientModule, EntityModule, EmailModule],
  providers: [PublisherService, DiscussionNotificationService, DiscussionService],
  exports: [DiscussionService],
})
export class DiscussionModule {}
