import { FilterQuery } from '@mikro-orm/core'
import { Injectable } from '@nestjs/common'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'

@Injectable()
export class SpaceMembershipCountFilterProvider {
  buildWhereCondition(spaceId: number): FilterQuery<SpaceMembership> {
    return { spaces: spaceId }
  }
}
