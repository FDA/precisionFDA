import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  Reference,
  IdentifiedReference,
} from '@mikro-orm/core'
import { User } from '../user/user.entity'
import { BaseEntity } from '../../database/base-entity'

@Entity({ tableName: 'notification_preferences' })
export class NotificationPreference extends BaseEntity {

  @PrimaryKey()
  id: number

  @Property()
  data: string

  @ManyToOne({ entity: () => User, serializedName: 'userId' })
  user!: IdentifiedReference<User>

  constructor(user: User) {
    super()
    this.user = Reference.create(user)
  }
}
