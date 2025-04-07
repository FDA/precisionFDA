import { AccessControlRepository } from '@shared/repository/access-control.repository'
import { Note } from '@shared/domain/note/note.entity'
import { FilterQuery } from '@mikro-orm/core'

export class NoteRepository extends AccessControlRepository<Note> {
  protected getAccessibleWhere(): Promise<FilterQuery<Note>> {
    throw new Error('Method not implemented.')
  }

  protected getEditableWhere(): Promise<FilterQuery<Note>> {
    throw new Error('Method not implemented.')
  }
}
