import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { AnswerModule } from '@shared/domain/answer/answer.module'
import { AppModule } from '@shared/domain/app/app.module'
import { ComparisonModule } from '@shared/domain/comparison/comparison.module'
import { Discussion } from '@shared/domain/discussion/discussion.entity'
import { DiscussionService } from '@shared/domain/discussion/services/discussion.service'
import { PublisherService } from '@shared/domain/discussion/services/publisher.service'
import { EmailModule } from '@shared/domain/email/email.module'
import { EntityLinkModule } from '@shared/domain/entity/entity-link/entity-link.module'
import { EntityModule } from '@shared/domain/entity/entity.module'
import { JobModule } from '@shared/domain/job/job.module'
import { NoteModule } from '@shared/domain/note/note.module'
import { SpaceModule } from '@shared/domain/space/space.module'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'
import { PlatformClientModule } from '@shared/platform-client/platform-client.module'
import { DiscussionReplyModule } from '../discussion-reply/discussion-reply.module'
import { DiscussionCountService } from '@shared/domain/discussion/services/discussion-count.service'
import { DiscussionScopeFilterProvider } from '@shared/domain/discussion/discussion-scope-filter.provider'

@Module({
  imports: [
    PlatformClientModule,
    EntityModule,
    EntityLinkModule,
    EmailModule,
    SpaceModule,
    AnswerModule,
    DiscussionReplyModule,
    UserFileModule,
    AppModule,
    JobModule,
    NoteModule,
    ComparisonModule,
    MikroOrmModule.forFeature([Discussion]),
  ],
  providers: [
    PublisherService,
    DiscussionService,
    DiscussionCountService,
    DiscussionScopeFilterProvider,
  ],
  exports: [DiscussionService, PublisherService],
})
export class DiscussionModule {}
