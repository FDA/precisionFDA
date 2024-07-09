import { Entity, Ref, ManyToOne, PrimaryKey, Property, Reference } from '@mikro-orm/core'
import { Space } from '@shared/domain/space/space.entity'
import { User } from '@shared/domain/user/user.entity'
import {
  SPACE_MEMBERSHIP_ROLE,
  SPACE_MEMBERSHIP_SIDE,
} from '../space-membership/space-membership.enum'
import { ENTITY_TYPE, SPACE_EVENT_ACTIVITY_TYPE, SPACE_EVENT_OBJECT_TYPE } from './space-event.enum'
import { SpaceEventRepository } from '@shared/domain/space-event/space-event.repository'

@Entity({ tableName: 'space_events', repository: () => SpaceEventRepository })
export class SpaceEvent {
  @PrimaryKey()
  id: number

  @Property({ hidden: true })
  createdAt = new Date()

  @Property()
  entityId: number

  @Property()
  entityType: ENTITY_TYPE

  @Property()
  activityType: SPACE_EVENT_ACTIVITY_TYPE

  @Property()
  objectType: SPACE_EVENT_OBJECT_TYPE

  @Property()
  role: SPACE_MEMBERSHIP_ROLE

  @Property()
  side: SPACE_MEMBERSHIP_SIDE

  @Property()
  data?: string

  @ManyToOne(() => User)
  user: Ref<User>

  @ManyToOne(() => Space)
  space: Ref<Space>

  constructor(user: User, space: Space) {
    this.user = Reference.create(user)
    this.space = Reference.create(space)
  }
}
