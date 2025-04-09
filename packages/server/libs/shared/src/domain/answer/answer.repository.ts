import { AccessControlRepository } from '@shared/repository/access-control.repository'
import { Answer } from '@shared/domain/answer/answer.entity'
import { FilterQuery } from '@mikro-orm/core'
import { User } from '@shared/domain/user/user.entity'
import { STATIC_SCOPE } from '@shared/enums'

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
    const manageableSpaces = await user.manageableSpaces()
    const scopes = manageableSpaces.map((space) => space.scope)

    const isSiteAdmin = await user.isSiteAdmin()
    if (isSiteAdmin) {
      return {}
    }

    return {
      note: {
        $or: [{ scope: STATIC_SCOPE.PUBLIC }, { scope: { $in: scopes } }, { user: user.id }],
      },
    }
  }
}
