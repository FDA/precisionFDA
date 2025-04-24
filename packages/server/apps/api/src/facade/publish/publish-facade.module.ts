import { Module } from '@nestjs/common'
import { EntityModule } from '@shared/domain/entity/entity.module'
import { EntityProvenanceModule } from '@shared/domain/provenance/entity-provenance.module'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'
import { PublishApiFacade } from './publish.facade'
import { AppModule } from '@shared/domain/app/app.module'
import { JobModule } from '@shared/domain/job/job.module'
import { NoteModule } from '@shared/domain/note/note.module'
import { ComparisonModule } from '@shared/domain/comparison/comparison.module'

@Module({
  imports: [
    EntityProvenanceModule,
    EntityModule,
    UserFileModule,
    AppModule,
    JobModule,
    NoteModule,
    ComparisonModule,
  ],
  providers: [PublishApiFacade],
  exports: [PublishApiFacade],
})
export class PublishApiFacadeModule {}
