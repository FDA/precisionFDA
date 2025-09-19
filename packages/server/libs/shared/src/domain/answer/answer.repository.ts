import { FilterQuery } from '@mikro-orm/core'
import { AccessControlRepository } from '@shared/database/repository/access-control.repository'
import { Answer } from '@shared/domain/answer/answer.entity'
import { STATIC_SCOPE } from '@shared/enums'
import { User } from '../user/user.entity'

export default class AnswerRepository extends AccessControlRepository<Answer> {
  protected async getAccessibleWhere(): Promise<FilterQuery<Answer>> {
    const user = await this.em.findOneOrFail(User, { id: this.user.id })
    const accessibleSpaces = await user.accessibleSpaces()
    const scopes = accessibleSpaces.map((space) => space.scope)

    const isSiteAdmin = await user.isSiteAdmin()
    if (isSiteAdmin) {
      return {}
    }

    return {
      note: {
        $or: [{ scope: STATIC_SCOPE.PUBLIC }, { scope: { $in: scopes } }],
      },
    }
  }

  protected async getEditableWhere(): Promise<FilterQuery<Answer>> {
    const user = await this.em.findOneOrFail(User, { id: this.user.id })
    const leadableSpaces = await user.leadableSpaces()
    const editableSpaces = await user.editableSpaces()
    const leadSpaceScopes = leadableSpaces.map((space) => space.scope)
    const editSpaceScopes = editableSpaces.map((space) => space.scope)

    const isSiteAdmin = await user.isSiteAdmin()
    if (isSiteAdmin) {
      return {}
    }

    return {
      note: {
        $or: [
          { user: user.id, scope: STATIC_SCOPE.PRIVATE },
          { user: user.id, scope: STATIC_SCOPE.PUBLIC },
          { user: user.id, scope: { $in: editSpaceScopes } },
          { scope: { $in: leadSpaceScopes } },
        ],
      },
    }
  }
}
