import { FilterQuery } from '@mikro-orm/mysql'
import { User } from '@shared/domain/user/user.entity'
import { STATIC_SCOPE } from '../../enums'
import { Node } from './node.entity'
import { Uid } from '@shared/domain/entity/domain/uid'
import { AccessControlRepository } from '@shared/repository/access-control.repository'

export class NodeRepository extends AccessControlRepository<Node> {
  protected async getAccessibleWhere(): Promise<FilterQuery<Node>> {
    const user = await this.em.findOne(User, { id: this.user.id })

    if (!user) {
      return null
    }

    const accessibleSpaces = await user.accessibleSpaces()
    const spaceScopes = accessibleSpaces.map((space) => space.scope)

    // TODO PFDA-6222: define rules for site-admins
    return {
      $or: [
        { user: user.id, scope: STATIC_SCOPE.PRIVATE },
        { scope: STATIC_SCOPE.PUBLIC },
        { scope: { $in: spaceScopes } },
      ],
    }
  }

  protected async getEditableWhere(): Promise<FilterQuery<Node>> {
    const user = await this.em.findOne(User, { id: this.user.id })

    if (!user) {
      return null
    }

    const editableSpaces = await user.editableSpaces()
    const spaceScopes = editableSpaces.map((space) => space.scope)

    // TODO PFDA-6222: define rules for site-admins

    return {
      $or: [
        { user: user.id, scope: STATIC_SCOPE.PRIVATE },
        { user: user.id, scope: STATIC_SCOPE.PUBLIC },
        { scope: { $in: spaceScopes } },
      ],
    }
  }

  /**
   * Loads node if it's accessible by user.
   * User needs to have populated ['spaceMemberships', 'spaceMemberships.spaces']
   *
   * @param user
   * @param uid
   * @param spaceIds
   */
  async loadIfAccessibleByUser(user: User, uid: Uid<'file'>, spaceIds: number[]): Promise<Node> {
    const scopes = spaceIds.map((id) => `space-${id}`)

    return await this.findOne(
      {
        uid: uid,
        $or: [
          { scope: STATIC_SCOPE.PUBLIC },
          { user: user.id, scope: STATIC_SCOPE.PRIVATE },
          { scope: { $in: (scopes as []) ?? [] } },
        ],
      },
      {},
    )
  }
}
