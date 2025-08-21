import { Module } from '@nestjs/common'
import { DiscussionService } from '@shared/domain/discussion/services/discussion.service'
import { PublisherService } from '@shared/domain/discussion/services/publisher.service'
import { EmailModule } from '@shared/domain/email/email.module'
import { EntityModule } from '@shared/domain/entity/entity.module'
import { SpaceModule } from '@shared/domain/space/space.module'
import { PlatformClientModule } from '@shared/platform-client/platform-client.module'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Discussion } from '@shared/domain/discussion/discussion.entity'
import { AnswerModule } from '@shared/domain/answer/answer.module'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'
import { AppModule } from '@shared/domain/app/app.module'
import { JobModule } from '@shared/domain/job/job.module'
import { NoteModule } from '@shared/domain/note/note.module'
import { ComparisonModule } from '@shared/domain/comparison/comparison.module'
import { EntityLinkModule } from '@shared/domain/entity/entity-link/entity-link.module'

@Module({
  imports: [
    PlatformClientModule,
    EntityModule,
    EntityLinkModule,
    EmailModule,
    SpaceModule,
    AnswerModule,
    UserFileModule,
    AppModule,
    JobModule,
    NoteModule,
    ComparisonModule,
    MikroOrmModule.forFeature([Discussion]),
  ],
  providers: [PublisherService, DiscussionService],
  exports: [DiscussionService, PublisherService, MikroOrmModule],
})
export class DiscussionModule {}
