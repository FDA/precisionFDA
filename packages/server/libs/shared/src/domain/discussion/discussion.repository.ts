import { FilterQuery } from '@mikro-orm/core'
import { AccessControlRepository } from '@shared/database/repository/access-control.repository'
import { Discussion } from '@shared/domain/discussion/discussion.entity'
import { User } from '@shared/domain/user/user.entity'
import { STATIC_SCOPE } from '@shared/enums'

export default class DiscussionRepository extends AccessControlRepository<Discussion> {
  protected async getAccessibleWhere(): Promise<FilterQuery<Discussion>> {
    const user = await this.em.findOneOrFail(User, { id: this.user.id })
    const accessibleSpaces = await user.accessibleSpaces()
    const scopes = accessibleSpaces.map(space => space.scope)

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
    // fetch editable first to prevent only leadable memberships caching
    const editableSpaces = await user.editableSpaces()
    const leadableSpaces = await user.leadableSpaces()
    const leadSpaceScopes = leadableSpaces.map(space => space.scope)
    const editSpaceScopes = editableSpaces.map(space => space.scope)

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
