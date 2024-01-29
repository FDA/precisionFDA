import { EntityManager } from '@mikro-orm/mysql'
import { SpaceEvent } from '@shared/domain/space-event/space-event.entity'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { Space } from '@shared/domain/space/space.entity'
import { User } from '@shared/domain/user/user.entity'
import { PermissionError, SpaceNotFoundError, UserNotFoundError } from '@shared/errors'
import { BaseOperation } from '@shared/utils/base-operation'
import { UserOpsCtx } from '../../../types'
import { spaceActionPolicy } from '../space.action-policy'
import { SPACE_STATE } from '../space.enum'
import { ENTITY_TYPE, PARENT_TYPE, SPACE_EVENT_ACTIVITY_TYPE, SPACE_EVENT_OBJECT_TYPE } from '../../space-event/space-event.enum'

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
      throw new SpaceNotFoundError()
    }
    if (!user) {
      throw new UserNotFoundError()
    }

    const canBeUnlockedByCurrentUser = await spaceActionPolicy.canUnlock(space, user)
    if (canBeUnlockedByCurrentUser) {
      try {
        await this.em.begin()
        space.state = SPACE_STATE.ACTIVE
        confidentialSpaces.forEach(cs => {
          cs.state = SPACE_STATE.ACTIVE
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

    throw new PermissionError('Unlock operation is not permitted.')
  }
}
