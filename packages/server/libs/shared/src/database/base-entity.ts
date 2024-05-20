import { PrimaryKey, Property } from '@mikro-orm/core'

export abstract class BaseEntity {
  @PrimaryKey()
  id!: number

  @Property({ hidden: true })
  createdAt = new Date()

  @Property({ onUpdate: () => new Date(), hidden: true })
  updatedAt = new Date()
}
