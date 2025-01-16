import { EntityRepository } from '@mikro-orm/mysql'
import { PermissionError } from '@shared/errors'
import { EntityScope } from '@shared/types/common'
import { SPACE_MEMBERSHIP_ROLE } from '../space-membership/space-membership.enum'
import { Space } from './space.entity'
import { getIdFromScopeName } from './space.helper'

export class SpaceRepository extends EntityRepository<Space> {
  async findSpacesByIdAndUser(spaceIds: number[], userId: number): Promise<Space[]> {
    const qb = this.em.createQueryBuilder(Space, 'space')
    qb.select('space.*')
      .join('spaceMemberships', 'sm')
      .where({ 'space.id': spaceIds })
      .andWhere({ 'sm.user_id': userId })
    return await qb.execute()
  }

  async findSpaceByScopeAndUser(scope: EntityScope, userId: number): Promise<Space | null> {
    const spaceId = getIdFromScopeName(scope)
    if (spaceId === null) {
      return
    }
    const space = await this.em.findOne(Space, {
      id: spaceId,
      spaceMemberships: {
        user: userId,
        role: {
          $in: [
            SPACE_MEMBERSHIP_ROLE.ADMIN,
            SPACE_MEMBERSHIP_ROLE.LEAD,
            SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR,
          ],
        },
      },
    })
    if (!space) {
      throw new PermissionError('Unable to publish: insufficient permissions.')
    }
    return space
  }
}
