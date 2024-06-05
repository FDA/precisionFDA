import { Injectable } from '@nestjs/common'
import { Note } from '@shared/domain/note/note.entity'
import { EntityLinkProvider } from '@shared/domain/entity/entity-link/entity-link.provider'

@Injectable()
export class NoteEntityLinkProvider extends EntityLinkProvider<'note'> {
  protected async getRelativeLink(note: Note) {
    return `/notes/${note.id}` as const
  }
}
