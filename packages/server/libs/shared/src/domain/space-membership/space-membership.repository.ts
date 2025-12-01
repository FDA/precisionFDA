import { PopulateHint } from '@mikro-orm/mysql'
import { PaginatedRepository } from '@shared/database/repository/paginated.repository'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { NotFoundError } from '@shared/errors'
import { SPACE_STATE } from '../space/space.enum'
import { SPACE_MEMBERSHIP_ROLE } from './space-membership.enum'

export class SpaceMembershipRepository extends PaginatedRepository<SpaceMembership> {
  async getMembership(spaceId: number, userId: number): Promise<SpaceMembership> {
    const memberships = await this.find({ spaces: spaceId, user: userId, active: true })
    if (memberships.length > 0) {
      return memberships[0]
    }
    throw new NotFoundError(`Couldn't find membership for user ${userId}`)
  }

  async findActiveMembershipAndSpace(
    userId: number,
    role: SPACE_MEMBERSHIP_ROLE,
  ): Promise<SpaceMembership[]> {
    return await this.em.find(
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
  }
}
