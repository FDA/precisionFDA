import { Module } from '@nestjs/common'
import { AttachmentsFacadeModule } from '@shared/facade/discussion/attachments-facade.module'
import { NotesController } from './notes.controller'

@Module({
  imports: [AttachmentsFacadeModule],
  controllers: [NotesController],
})
export class NotesApiModule {}
