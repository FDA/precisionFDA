import {
  IdentifiedReference,
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
  Reference,
} from '@mikro-orm/core'
import { BaseEntity } from '../../database/base-entity'
import { User } from '..'

@Entity({ tableName: 'sessions' })
export class Session extends BaseEntity {
  @PrimaryKey()
  id: number

  @Property()
  key: string

  @ManyToOne({ entity: () => User, fieldName: 'user_id' })
  user!: IdentifiedReference<User>

  constructor(user: User) {
    super()
    this.user = Reference.create(user)
  }
}
