import { EntityRepository, PopulateHint } from '@mikro-orm/mysql'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { NotFoundError } from '@shared/errors'
import { SPACE_STATE } from '../space/space.enum'
import { SPACE_MEMBERSHIP_ROLE } from './space-membership.enum'

export class SpaceMembershipRepository extends EntityRepository<SpaceMembership> {
  protected getEntityKey(): string {
    return 'space_memberships'
  }

  async getMembership(spaceId: number, userId: number): Promise<SpaceMembership> {
    const qb = this.em.createQueryBuilder(SpaceMembership)
    qb.select('*')
      .where({ spaces: { id: spaceId } })
      .where({ user: { id: userId } })
      .where({ active: true })
    const memberships = await qb.execute()
    if (memberships.length > 0) {
      return memberships[0]
    }
    throw new NotFoundError(`Couldn't find membership for user ${userId}`)
  }

  async findActiveSpaceIdsByUserId(userId: number): Promise<number[]> {
    const qb = this.em.createQueryBuilder(SpaceMembership, 'sm')

    const result = await qb
      .select(['space.id'])
      .join('sm.spaces', 'space')
      .where({
        'sm.user': userId,
        'sm.active': true,
      })
      .getResultList()

    return result.map((space) => space.id)
  }

  async findActiveMembershipAndSpace(
    userId: number,
    role: SPACE_MEMBERSHIP_ROLE,
  ): Promise<SpaceMembership[]> {
    const spaceMemberships = await this.em.find(
      SpaceMembership,
      {
        user: userId,
        role,
        active: true,
        spaces: {
          state: SPACE_STATE.ACTIVE,
        },
      },
      {
        populate: ['spaces'],
        populateWhere: PopulateHint.INFER,
      },
    )
    return spaceMemberships
  }
}
