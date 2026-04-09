import { Injectable } from '@nestjs/common'
import { EntityLinkProvider } from '@shared/domain/entity/entity-link/entity-link.provider'
import { Note } from '@shared/domain/note/note.entity'

@Injectable()
export class NoteEntityLinkProvider extends EntityLinkProvider<'note'> {
  protected async getRelativeLink(note: Note) {
    return `/notes/${note.id}` as const
  }
}
