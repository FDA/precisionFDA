import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable } from '@nestjs/common'
import { SpaceMembershipCountFilterProvider } from '@shared/domain/space-membership/service/space-membership-count-filter.provider'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'

@Injectable()
export class SpaceMembershipCountService {
  constructor(
    private readonly em: SqlEntityManager,
    private readonly spaceMembershipCountFilterProvider: SpaceMembershipCountFilterProvider,
  ) {}

  async countBySpace(spaceId: number): Promise<number> {
    return this.em.count(SpaceMembership, this.spaceMembershipCountFilterProvider.buildWhereCondition(spaceId))
  }
}
