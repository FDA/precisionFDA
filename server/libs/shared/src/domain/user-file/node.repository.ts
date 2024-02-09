import { EntityRepository } from '@mikro-orm/mysql'
import { User } from '@shared/domain/user/user.entity'
import { STATIC_SCOPE } from '../../enums'
import { Node } from './node.entity'

export class NodeRepository extends EntityRepository<Node> {
  /**
   * Loads node if it's accessible by user.
   * User needs to have populated ['spaceMemberships', 'spaceMemberships.spaces']
   *
   * @param user
   * @param uid
   */
  async loadIfAccessibleByUser(user: User, uid: string): Promise<Node | null> {
    // @ts-ignore
    return await this.findOne({
      $or: [
        { scope: STATIC_SCOPE.PUBLIC.toString() },
        { user, scope: STATIC_SCOPE.PRIVATE.toString() },
        { scope: { $in: user.spaceUids ?? [] } },
      ],
      uid,
    })
  }
}
