import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { Note } from '@shared/domain/note/note.entity'
import { NoteService } from './note.service'

@Module({
  imports: [MikroOrmModule.forFeature([Note])],
  providers: [NoteService],
  exports: [MikroOrmModule, NoteService],
})
export class NoteModule {}
