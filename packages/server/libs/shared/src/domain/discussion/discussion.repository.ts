import { FilterQuery } from '@mikro-orm/core'
import { Discussion } from '@shared/domain/discussion/discussion.entity'
import { User } from '@shared/domain/user/user.entity'
import { STATIC_SCOPE } from '@shared/enums'
import { AccessControlRepository } from '@shared/repository/access-control.repository'

export default class DiscussionRepository extends AccessControlRepository<Discussion> {
  protected async getAccessibleWhere(): Promise<FilterQuery<Discussion>> {
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

  protected async getEditableWhere(): Promise<FilterQuery<Discussion>> {
    const user = await this.em.findOneOrFail(User, { id: this.user.id })
    const manageableSpaces = await user.manageableSpaces()
    const scopes = manageableSpaces.map((space) => space.scope)

    const isSiteAdmin = await user.isSiteAdmin()
    if (isSiteAdmin) {
      return {}
    }

    return {
      note: {
        $or: [
          { scope: STATIC_SCOPE.PUBLIC, user: user.id },
          { scope: { $in: scopes } },
          { user: user.id },
        ],
      },
    }
  }
}
