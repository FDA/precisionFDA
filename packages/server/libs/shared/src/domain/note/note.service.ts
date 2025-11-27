import { Injectable } from '@nestjs/common'
import { Note } from './note.entity'
import { NoteRepository } from './note.repository'

@Injectable()
export class NoteService {
  constructor(private readonly noteRepository: NoteRepository) {}

  async findAccessibleNotesAndAttachments(noteIds: number[]): Promise<Note[]> {
    return await this.noteRepository.findAccessible(
      { id: { $in: noteIds } },
      { populate: ['attachments'] },
    )
  }
}
