import type { SqlEntityManager } from '@mikro-orm/mysql'
import type {
  SpaceEventInput,
} from '../space-event.input'
import { SpaceEvent } from '../space-event.entity'
import { Space } from '../../space'
import { User } from '../../user'
import { BaseOperation } from '../../../utils'
import type { UserOpsCtx } from '../../../types'
import { email } from '../../..'
import { SpaceMembership } from '../..'
import { getEntityType, getObjectType, getSpaceEventJsonData } from '../../../utils/object-utils'

// TODO add infrastructure for Task in the future

/**
 * Operation creates SpaceEvent and triggers sending email notification.
 */
class CreateSpaceEventOperation extends BaseOperation<UserOpsCtx, SpaceEventInput, SpaceEvent | undefined> {
  async run(input: SpaceEventInput) {
    const em = this.ctx.em
    const membership = await this.getMembership(input, em)

    const space = await em.findOne(Space, input.spaceId)
    const user = await em.findOne(User, this.ctx.user.id)
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

      await em.persistAndFlush(spaceEvent)

      await new email.NotificationSendOperation(this.ctx).execute(spaceEvent)

      return spaceEvent
    }
  }

  private async getMembership(input: SpaceEventInput, em: SqlEntityManager): Promise<SpaceMembership> {
    if (!input.membership) {
      const qb = em.createQueryBuilder(SpaceMembership)
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

export { CreateSpaceEventOperation }
