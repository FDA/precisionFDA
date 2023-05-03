import {
  Entity,
  PrimaryKey,
  Property,
  Reference,
  IdentifiedReference, JsonType, OneToOne,
} from '@mikro-orm/core'
import { User } from '../user/user.entity'
import { BaseEntity } from '../../database/base-entity'
import { NOTIFICATION_TYPES } from '../email/email.config'
import { isNil} from 'ramda'

class NotificationType extends JsonType {
  convertToJSValue(value: string | null): typeof NOTIFICATION_TYPES | null {
    if (isNil(value)) {
      return value
    }

    return JSON.parse(value)
  }
}

@Entity({ tableName: 'notification_preferences' })
export class NotificationPreference {

  @PrimaryKey()
  id: number

  @Property({ type: NotificationType })
  data: typeof NOTIFICATION_TYPES

  @OneToOne({ entity: () => User, serializedName: 'userId' })
  user!: IdentifiedReference<User>

  constructor(user: User) {
    this.user = Reference.create(user)
  }
}
