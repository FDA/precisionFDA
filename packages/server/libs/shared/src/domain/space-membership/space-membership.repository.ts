import { PopulateHint } from '@mikro-orm/mysql'
import { PaginatedRepository } from '@shared/database/repository/paginated.repository'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { NotFoundError } from '@shared/errors'
import { Space } from '../space/space.entity'
import { SPACE_STATE, SPACE_TYPE } from '../space/space.enum'
import { SPACE_MEMBERSHIP_ROLE, SPACE_MEMBERSHIP_SIDE } from './space-membership.enum'

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

  async findChangeableMemberships(
    space: Space,
    membershipIds: number[],
    active: boolean,
    currentMembership: SpaceMembership,
  ): Promise<SpaceMembership[]> {
    let side = {}
    if (space.type === SPACE_TYPE.GROUPS) {
      side = { $in: [SPACE_MEMBERSHIP_SIDE.HOST, SPACE_MEMBERSHIP_SIDE.GUEST] }
    } else {
      side = currentMembership.side
    }
    const changeableMemberships = await this.em.find(SpaceMembership, {
      id: membershipIds,
      spaces: { $in: [space.id] },
      role: [
        SPACE_MEMBERSHIP_ROLE.ADMIN,
        SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR,
        SPACE_MEMBERSHIP_ROLE.VIEWER,
      ],
      side,
      active,
    })

    if (space.type !== SPACE_TYPE.REVIEW) {
      return changeableMemberships
    }

    const userIds = changeableMemberships.map((m) => m.user.id)
    const confidentialMemberships = await this.em.find(SpaceMembership, {
      id: { $nin: membershipIds },
      spaces: { space: space.id, state: SPACE_STATE.ACTIVE },
      user: { id: { $in: userIds } },
      side,
      role: [
        SPACE_MEMBERSHIP_ROLE.ADMIN,
        SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR,
        SPACE_MEMBERSHIP_ROLE.VIEWER,
      ],
      active,
    })
    return [...changeableMemberships, ...confidentialMemberships]
  }

  async findConfidentialMembershipByUser(
    spaceId: number,
    userId: number,
    side: SPACE_MEMBERSHIP_SIDE,
  ): Promise<SpaceMembership | null> {
    return this.em.findOne(SpaceMembership, {
      spaces: {
        space: spaceId,
        state: SPACE_STATE.ACTIVE,
      },
      user: userId,
      side,
    })
  }
}
