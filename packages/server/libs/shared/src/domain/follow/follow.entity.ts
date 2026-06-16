import { Entity, Property } from '@mikro-orm/core'
import { BaseEntity } from '../../database/base.entity'

@Entity({ tableName: 'follows', abstract: true, discriminatorColumn: 'followableType' })
export class Follow extends BaseEntity {
  @Property()
  followableType: string

  @Property()
  followerId: number

  @Property()
  followerType: string

  @Property()
  blocked: boolean
}
