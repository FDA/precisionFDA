import { EntityRepository } from '@mikro-orm/mysql'
import { User } from '@shared/domain/user/user.entity'
import { STATIC_SCOPE } from '../../enums'
import { Node } from './node.entity'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { Uid } from '@shared/domain/entity/domain/uid'

export class NodeRepository extends EntityRepository<Node> {
  /**
   * Loads node if it's accessible by user.
   * User needs to have populated ['spaceMemberships', 'spaceMemberships.spaces']
   *
   * @param user
   * @param uid
   */
  async loadIfAccessibleByUser(user: User, uid: Uid<'file'>) {
    const smRepository = this.em.getRepository(SpaceMembership)
    const spaceUids = await smRepository.findActiveSpaceIdsByUserId(user.id)
    const scopes = spaceUids.map((id) => `space-${id}`)
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
