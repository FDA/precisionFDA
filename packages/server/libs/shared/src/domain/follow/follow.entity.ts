import { Entity, PrimaryKey, Property } from '@mikro-orm/core'
import { BaseEntity } from '../../database/base.entity'

// this might be done as "comment" - abstract table with discriminator column
@Entity({ tableName: 'follows', abstract: true, discriminatorColumn: 'followableType' })
export class Follow extends BaseEntity {
  @PrimaryKey()
  id: number

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
