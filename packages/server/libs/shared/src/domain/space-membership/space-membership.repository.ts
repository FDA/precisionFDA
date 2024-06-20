import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { EntityRepository } from '@mikro-orm/mysql'
import { NotFoundError } from '@shared/errors'

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
}
