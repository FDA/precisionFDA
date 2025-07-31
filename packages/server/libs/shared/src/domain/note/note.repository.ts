import { AccessControlRepository } from '@shared/database/repository/access-control.repository'
import { Note } from '@shared/domain/note/note.entity'
import { FilterQuery } from '@mikro-orm/core'
import { User } from '@shared/domain/user/user.entity'
import { STATIC_SCOPE } from '@shared/enums'

export class NoteRepository extends AccessControlRepository<Note> {
  protected async getAccessibleWhere(): Promise<FilterQuery<Note>> {
    const user = await this.em.findOneOrFail(User, { id: this.user.id })
    const accessibleSpaces = await user.accessibleSpaces()
    const scopes = accessibleSpaces.map((space) => space.scope)

    const isSiteAdmin = await user.isSiteAdmin()
    if (isSiteAdmin) {
      return {}
    }

    return {
      $or: [
        { scope: STATIC_SCOPE.PUBLIC },
        { scope: { $in: scopes } },
        { user: user.id, scope: STATIC_SCOPE.PRIVATE },
      ],
    }
  }

  protected async getEditableWhere(): Promise<FilterQuery<Note>> {
    const user = await this.em.findOneOrFail(User, { id: this.user.id })
    const editableSpaces = await user.editableSpaces()
    const scopes = editableSpaces.map((space) => space.scope)

    const isSiteAdmin = await user.isSiteAdmin()
    if (isSiteAdmin) {
      return {}
    }

    return {
      $or: [
        { user: user.id, scope: STATIC_SCOPE.PUBLIC },
        { user: user.id, scope: STATIC_SCOPE.PRIVATE },
        { scope: { $in: scopes } },
      ],
    }
  }
}
