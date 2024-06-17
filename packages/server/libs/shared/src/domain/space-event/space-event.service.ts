import { Injectable, Logger } from '@nestjs/common'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { Space } from '@shared/domain/space/space.entity'
import { User } from '@shared/domain/user/user.entity'
import { SpaceEvent } from '@shared/domain/space-event/space-event.entity'
import { getEntityType, getObjectType, getSpaceEventJsonData } from '@shared/utils/object-utils'
import { NotificationSendOperation } from '@shared/domain/email/ops/notification-send'
import { SpaceEventInput } from '@shared/domain/space-event/space-event.input'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { UserContext } from '@shared/domain/user-context/model/user-context'

// TODO create test cases https://jira.internal.dnanexus.com/browse/PFDA-5403
@Injectable()
export class SpaceEventService {
  @ServiceLogger()
  private readonly log: Logger

  constructor(
    private readonly em: SqlEntityManager,
    private readonly user: UserContext,
  ) {}

  async createSpaceEvent(input: SpaceEventInput): Promise<SpaceEvent | undefined> {
    const membership = await this.getMembership(input)

    const space = await this.em.findOne(Space, input.spaceId)
    const user = await this.em.findOne(User, this.user.id)
    if (space !== null && user !== null) {
      const spaceEvent = new SpaceEvent(user, space)
      spaceEvent.activityType = input.activityType
      spaceEvent.side = membership.side
      spaceEvent.role = membership.role
      spaceEvent.entityId = input.entity.value.id
      spaceEvent.entityType = getEntityType(input.entity)
      spaceEvent.objectType = getObjectType(input.entity)

      const objectData = getSpaceEventJsonData(input.entity)
      spaceEvent.data = objectData || undefined

      await this.em.persistAndFlush(spaceEvent)

      // TODO move this to Service model
      await new NotificationSendOperation({ em: this.em, log: this.log, user: this.user }).execute(
        spaceEvent,
      )

      return spaceEvent
    }
  }
  private async getMembership(input: SpaceEventInput): Promise<SpaceMembership> {
    if (!input.membership) {
      const qb = this.em.createQueryBuilder(SpaceMembership)
      qb.select('*')
        .where({ spaces: { id: input.spaceId } })
        .where({ user: { id: input.userId } })
        .where({ active: true })
      const memberships = await qb.execute()
      if (memberships.length > 0) {
        return memberships[0]
      }
      throw new Error(`Couldn't find membership for user ${input.userId.toString()}`)
    }
    return input.membership
  }
}
