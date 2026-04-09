import { Module } from '@nestjs/common'
import { AppModule } from '@shared/domain/app/app.module'
import { ComparisonModule } from '@shared/domain/comparison/comparison.module'
import { DiscussionModule } from '@shared/domain/discussion/discussion.module'
import { EntityModule } from '@shared/domain/entity/entity.module'
import { JobModule } from '@shared/domain/job/job.module'
import { NoteModule } from '@shared/domain/note/note.module'
import { EntityProvenanceModule } from '@shared/domain/provenance/entity-provenance.module'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'
import { PublishApiFacade } from './publish.facade'
import { PublisherFacade } from './publisher.facade'

@Module({
  imports: [
    EntityProvenanceModule,
    EntityModule,
    UserFileModule,
    AppModule,
    JobModule,
    NoteModule,
    ComparisonModule,
    DiscussionModule,
  ],
  providers: [PublishApiFacade, PublisherFacade],
  exports: [PublishApiFacade, PublisherFacade],
})
export class PublishApiFacadeModule {}
