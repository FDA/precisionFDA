import {
  Ref,
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
  Reference,
} from '@mikro-orm/core'
import { User } from '@shared/domain/user/user.entity'
import { BaseEntity } from '../../database/base-entity'

@Entity({ tableName: 'sessions' })
export class Session extends BaseEntity {
  @PrimaryKey()
  id: number

  @Property()
  key: string

  @ManyToOne({ entity: () => User, fieldName: 'user_id' })
  user!: Ref<User>

  constructor(user: User) {
    super()
    this.user = Reference.create(user)
  }
}
