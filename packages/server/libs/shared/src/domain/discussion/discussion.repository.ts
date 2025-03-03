import { PaginatedRepository } from '@shared/domain/entity/repository/paginated.repository'
import { Discussion } from '@shared/domain/discussion/discussion.entity'
import { User } from '@shared/domain/user/user.entity'
import { STATIC_SCOPE } from '@shared/enums'
import { EntityScope } from '@shared/types/common'

export default class DiscussionRepository extends PaginatedRepository<Discussion> {
  async findAccessibleByIdAndUser(id: number, user: User): Promise<Discussion | null> {
    const accessibleSpaces = await user.accessibleSpaces()
    const accessibleScopes: EntityScope[] = accessibleSpaces.map((space) => space.scope)

    accessibleScopes.push(STATIC_SCOPE.PUBLIC)

    return this.findOne({
      id,
      note: {
        scope: { $in: accessibleScopes },
      },
    })
  }

  async findEditableByIdAndUser(id: number, user: User): Promise<Discussion | null> {
    const editableSpaces = await user.editableSpaces()
    const editableScopes: EntityScope[] = editableSpaces.map((space) => space.scope)

    return this.findOne({
      id,
      note: {
        $or: [{ user: user.id, scope: STATIC_SCOPE.PUBLIC }, { scope: { $in: editableScopes } }],
      },
    })
  }
}
