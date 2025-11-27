import { Module } from '@nestjs/common'
import { AppModule } from '@shared/domain/app/app.module'
import { AttachmentModule } from '@shared/domain/attachment/attachment.module'
import { ComparisonModule } from '@shared/domain/comparison/comparison.module'
import { EmailModule } from '@shared/domain/email/email.module'
import { EntityModule } from '@shared/domain/entity/entity.module'
import { JobModule } from '@shared/domain/job/job.module'
import { NoteModule } from '@shared/domain/note/note.module'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'
import { AttachmentManagementFacade } from './attachment-management.facade'
import { AttachmentRetrieveFacade } from './attachment-retrieve.facade'

@Module({
  imports: [
    UserFileModule,
    AppModule,
    JobModule,
    NoteModule,
    ComparisonModule,
    AttachmentModule,
    EmailModule,
    EntityModule,
  ],
  providers: [AttachmentManagementFacade, AttachmentRetrieveFacade],
  exports: [AttachmentManagementFacade, AttachmentRetrieveFacade],
})
export class AttachmentsFacadeModule {}
