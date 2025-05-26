import { Module } from '@nestjs/common'
import { EmailModule } from '@shared/domain/email/email.module'
import { AttachmentManagementFacade } from './attachment-management.facade'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'
import { AppModule } from '@shared/domain/app/app.module'
import { JobModule } from '@shared/domain/job/job.module'
import { NoteModule } from '@shared/domain/note/note.module'
import { ComparisonModule } from '@shared/domain/comparison/comparison.module'
import { AttachmentModule } from '@shared/domain/attachment/attachment.module'
import { EntityModule } from '@shared/domain/entity/entity.module'

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
  providers: [AttachmentManagementFacade],
  exports: [AttachmentManagementFacade],
})
export class AttachmentsFacadeModule {}
