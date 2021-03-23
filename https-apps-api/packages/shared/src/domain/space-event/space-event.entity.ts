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
import { BaseEntity } from '../../database/base-entity'
import {
  PARENT_TYPE,
  SPACE_EVENT_ACTIVITY_TYPE,
  SPACE_EVENT_OBJECT_TYPE,
  SPACE_EVENT_ROLE,
  SPACE_EVENT_SIDE,
} from './space-event.enum'

@Entity({ tableName: 'space_events' })
export class SpaceEvent extends BaseEntity {
  @PrimaryKey()
  id: number

  @Property()
  entityId: number

  @Property()
  entityType: PARENT_TYPE

  @Property()
  activityType: SPACE_EVENT_ACTIVITY_TYPE

  @Property()
  objectType: SPACE_EVENT_OBJECT_TYPE

  @Property()
  role: SPACE_EVENT_ROLE

  @Property()
  side: SPACE_EVENT_SIDE

  @Property()
  data: JsonType

  @ManyToOne()
  user: IdentifiedReference<User>

  @Property()
  space: IdentifiedReference<Space>

  constructor(user: User, space: Space) {
    super()
    this.user = Reference.create(user)
    this.space = Reference.create(space)
  }
}
