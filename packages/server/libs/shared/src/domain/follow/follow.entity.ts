import { Entity, PrimaryKey, Property } from '@mikro-orm/core'
import { BaseEntity } from '../../database/base-entity'

@Entity({ tableName: 'follows' })
export class Follow extends BaseEntity {
  @PrimaryKey()
  id: number

  @Property()
  followableId: number

  @Property()
  followableType: string

  @Property()
  followerId: number

  @Property()
  followerType: string

  @Property()
  blocked: boolean

  constructor() {
    super()
    // this.followableId = Reference.create(discussion).id
    // this.followableType = 'Discussion'
  }
}
