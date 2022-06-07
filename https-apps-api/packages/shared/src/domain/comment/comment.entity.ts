import {
  Entity,
  IdentifiedReference,
  ManyToOne,
  PrimaryKey,
  Property,
  Reference,
} from '@mikro-orm/core'
import { User } from '..'
import { BaseEntity } from '../../database/base-entity'

@Entity({ tableName: 'comments' })
export class Comment extends BaseEntity {
  @PrimaryKey()
  id: number

  @Property()
  commentableId: number

  @Property()
  commentableType: string

  @Property()
  body: string

  @Property()
  contentObjectId: number

  @Property()
  contentObjectType: string

  @ManyToOne({ entity: () => User, fieldName: 'user_id' })
  user!: IdentifiedReference<User>

  constructor(user: User) {
    super()
    this.user = Reference.create(user)
  }
}
