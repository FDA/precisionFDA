import { FilterQuery } from '@mikro-orm/mysql'
import { Space } from './space.entity'
import { SPACE_MEMBERSHIP_ROLE } from '../space-membership/space-membership.enum'
import { User } from '@shared/domain/user/user.entity'
import { AccessControlRepository } from '@shared/database/repository/access-control.repository'

export class SpaceRepository extends AccessControlRepository<Space> {
  protected async getAccessibleWhere(): Promise<FilterQuery<Space>> {
    const user = await this.em.findOneOrFail(User, { id: this.user.id })

    return {
      spaceMemberships: {
        user: user.id,
        active: true,
      },
    }
  }

  protected async getEditableWhere(): Promise<FilterQuery<Space>> {
    const user = await this.em.findOneOrFail(User, { id: this.user.id })

    const isSiteAdmin = await user.isSiteAdmin()
    if (isSiteAdmin) {
      return {}
    }

    return {
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
    }
  }

  async findSpacesByIdAndUser(spaceIds: number[], userId: number): Promise<Space[]> {
    const qb = this.em.createQueryBuilder(Space, 'space')
    qb.select('space.*')
      .join('spaceMemberships', 'sm')
      .where({ 'space.id': spaceIds })
      .andWhere({ 'sm.user_id': userId })
    return await qb.execute()
  }
}
