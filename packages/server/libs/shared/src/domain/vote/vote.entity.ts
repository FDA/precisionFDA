import { Entity, PrimaryKey, Property } from '@mikro-orm/core'
import { BaseEntity } from '../../database/base-entity'

@Entity({ tableName: 'votes' })
export class Vote extends BaseEntity {
  @PrimaryKey()
  id: number

  @Property()
  votableId: number

  @Property()
  votableType: string

  @Property()
  voterId: number

  @Property()
  voterType: string

  @Property()
  voteFlag: number

  @Property()
  voteScope: string

  @Property()
  voteWeight: number
}
