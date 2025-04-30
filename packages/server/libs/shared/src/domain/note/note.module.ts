import { Module } from '@nestjs/common'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Note } from '@shared/domain/note/note.entity'

@Module({
  imports: [MikroOrmModule.forFeature([Note])],
  providers: [],
  exports: [MikroOrmModule],
})
export class NoteModule {}
