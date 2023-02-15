import { EntityManager } from '@mikro-orm/mysql'
import { Space, User, SpaceEvent, SpaceMembership } from '../..'
import { BaseOperation } from '../../../utils'
import { UserOpsCtx } from '../../../types'
import { spaceActionPolicy } from '../space.action-policy'
import { SPACE_STATE } from '../space.enum'
import { PARENT_TYPE, SPACE_EVENT_ACTIVITY_TYPE, SPACE_EVENT_OBJECT_TYPE } from '../../space-event/space-event.enum'
import { errors } from '../../..'

type SpaceUnlockInput = { spaceId: number }

export class SpaceUnlockOperation extends BaseOperation<
UserOpsCtx,
SpaceUnlockInput,
void
> {
  private em: EntityManager
  async run(input: SpaceUnlockInput): Promise<void> {
    this.em = this.ctx.em
    const userId = this.ctx.user.id
    // combine all queries to run in parallel and not wait for each other
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

    const canBeUnlockedByCurrentUser = await spaceActionPolicy.canUnlock(space, user)
    if (canBeUnlockedByCurrentUser) {
      try {
        await this.em.begin()
        space.state = SPACE_STATE.STATE_ACTIVE
        confidentialSpaces.forEach(cs => {
          cs.state = SPACE_STATE.STATE_ACTIVE
        })

        const membership = await this.ctx.em.findOne(
          SpaceMembership,
          { spaces: input.spaceId },
        )

        const spaceEvent = this.em.create(SpaceEvent, {
          space,
          user,
          entityId: input.spaceId,
          entityType: PARENT_TYPE.SPACE,
          activityType: SPACE_EVENT_ACTIVITY_TYPE.space_unlocked,
          objectType: SPACE_EVENT_OBJECT_TYPE.SPACE,
          // @ts-ignore
          side: membership?.side,
          // @ts-ignore
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

    throw new errors.PermissionError('Unlock operation is not permitted.')
  }
}
