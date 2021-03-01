import { Entity, PrimaryKey, Property } from '@mikro-orm/core'

@Entity({ tableName: 'events' })
export class JobClosedEvent {
  @PrimaryKey()
  id: number

  @Property()
  type: string

  @Property()
  orgHandle: string

  @Property()
  dxuser: string

  // dxid
  @Property()
  param1: string

  // app_dxid
  @Property()
  param2: string

  @Property()
  param3: string

  @Property()
  param4: string

  @Property()
  createdAt = new Date()
}
