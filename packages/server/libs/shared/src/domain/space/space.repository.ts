import { EntityRepository } from '@mikro-orm/mysql'
import { Space } from './space.entity'
import { SPACE_MEMBERSHIP_ROLE } from '../space-membership/space-membership.enum'
import { User } from '@shared/domain/user/user.entity'

export class SpaceRepository extends EntityRepository<Space> {
  async findSpacesByIdAndUser(spaceIds: number[], userId: number): Promise<Space[]> {
    const qb = this.em.createQueryBuilder(Space, 'space')
    qb.select('space.*')
      .join('spaceMemberships', 'sm')
      .where({ 'space.id': spaceIds })
      .andWhere({ 'sm.user_id': userId })
    return await qb.execute()
  }

  async findAccessibleByIdAndUser(spaceId: number, user: User): Promise<Space | null> {
    return this.em.findOne(Space, {
      id: spaceId,
      spaceMemberships: {
        user: user.id,
        active: true,
      },
    })
  }

  async findEditableByIdAndUser(spaceId: number, user: User): Promise<Space | null> {
    return this.em.findOne(Space, {
      id: spaceId,
      spaceMemberships: {
        user: user.id,
        active: true,
        role: {
          $in: [
            SPACE_MEMBERSHIP_ROLE.ADMIN,
            SPACE_MEMBERSHIP_ROLE.LEAD,
            SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR,
          ],
        },
      },
    })
  }
}
