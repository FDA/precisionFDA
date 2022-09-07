import { Entity, PrimaryKey, Property } from '@mikro-orm/core'

@Entity({ tableName: 'events' })
export class Event {
  @PrimaryKey()
  id: number

  @Property()
  type: string

  @Property()
  orgHandle: string

  @Property()
  dxuser: string

  // dxid
  @Property({ nullable: true })
  param1: string

  // app_dxid
  @Property({ nullable: true })
  param2: string

  @Property({ nullable: true })
  param3: string

  @Property({ nullable: true })
  param4: string

  @Property({ nullable: true })
  data: string

  @Property()
  createdAt = new Date()
}
