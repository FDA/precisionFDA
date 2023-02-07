import {
  Entity,
  IdentifiedReference,
  JsonType,
  ManyToOne,
  PrimaryKey,
  Property,
  Reference,
} from '@mikro-orm/core'
import { User, Space } from '..'
import {
  SPACE_MEMBERSHIP_ROLE,
  SPACE_MEMBERSHIP_SIDE,
} from '../space-membership/space-membership.enum'
import { PARENT_TYPE, SPACE_EVENT_ACTIVITY_TYPE, SPACE_EVENT_OBJECT_TYPE } from './space-event.enum'

@Entity({ tableName: 'space_events' })
export class SpaceEvent {
  @PrimaryKey()
  id: number

  @Property({ hidden: true })
  createdAt = new Date()

  @Property()
  entityId: number

  @Property()
  entityType: PARENT_TYPE

  @Property()
  activityType: SPACE_EVENT_ACTIVITY_TYPE

  @Property()
  objectType: SPACE_EVENT_OBJECT_TYPE

  @Property()
  role: SPACE_MEMBERSHIP_ROLE

  @Property()
  side: SPACE_MEMBERSHIP_SIDE

  @Property()
  data: string

  @ManyToOne(() => User)
  user: IdentifiedReference<User>

  @ManyToOne(() => Space)
  space: IdentifiedReference<Space>

  constructor(user: User, space: Space) {
    this.user = Reference.create(user)
    this.space = Reference.create(space)
  }
}
