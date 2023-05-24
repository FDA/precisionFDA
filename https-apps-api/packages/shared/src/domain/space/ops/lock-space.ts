import { EntityManager } from '@mikro-orm/mysql'
import { Space, User, SpaceEvent, SpaceMembership } from '../..'
import { BaseOperation } from '../../../utils'
import { UserOpsCtx } from '../../../types'
import { spaceActionPolicy } from '../space.action-policy'
import { SPACE_STATE } from '../space.enum'
import { ENTITY_TYPE, PARENT_TYPE, SPACE_EVENT_ACTIVITY_TYPE, SPACE_EVENT_OBJECT_TYPE } from '../../space-event/space-event.enum'
import { errors } from '../../..'

type SpaceLockInput = { spaceId: number }

export class SpaceLockOperation extends BaseOperation<
UserOpsCtx,
SpaceLockInput,
void
> {
  private em: EntityManager

  async run(input: SpaceLockInput): Promise<void> {
    this.em = this.ctx.em
    const userId = this.ctx.user.id

    const user = await this.em.findOne(
      User,
      { id: userId },
      { populate: ['adminMemberships', 'adminMemberships.adminGroup'] },
    )
    const space = await this.em.findOne(
      Space,
      { id: input.spaceId }, {},
    )
    const confidentialSpaces = await this.em.find(
      Space,
      { spaceId: input.spaceId }, {},
    )

    if (!space) {
      throw new errors.SpaceNotFoundError()
    }
    if (!user) {
      throw new errors.UserNotFoundError()
    }

    const canBeLockedByCurrentUser = await spaceActionPolicy.canLock(space, user)
    if (canBeLockedByCurrentUser) {
      try {
        await this.em.begin()
        space.state = SPACE_STATE.LOCKED
        confidentialSpaces.forEach(cs => {
          cs.state = SPACE_STATE.LOCKED
        })

        const membership = await this.ctx.em.findOne(
          SpaceMembership,
          { spaces: input.spaceId },
        )
        
        const spaceEvent = this.em.create(SpaceEvent, {
          space,
          user,
          entityId: input.spaceId,
          entityType: ENTITY_TYPE.SPACE,
          activityType: SPACE_EVENT_ACTIVITY_TYPE.space_locked,
          objectType: SPACE_EVENT_OBJECT_TYPE.SPACE,
          //@ts-ignore
          side: membership?.side,
          //@ts-ignore
          role: membership?.role,
          data: JSON.stringify({ name: space.name }),
        })
        await this.em.persistAndFlush(spaceEvent)
        await this.em.commit()
      } catch (err) {
        await this.em.rollback()
        throw err
      }
      return
    }

    throw new errors.PermissionError('Lock operation is not permitted.')
  }
}
