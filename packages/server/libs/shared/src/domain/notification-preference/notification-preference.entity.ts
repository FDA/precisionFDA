import { Entity, JsonType, OneToOne, PrimaryKey, Property, Ref, Reference } from '@mikro-orm/core'
import { isNil } from 'ramda'
import { NOTIFICATION_TYPES } from '../email/email.config'
import { User } from '../user/user.entity'
import { DEFAULT_NOTIFICATION_PREFERENCES } from './notification-preference.config'
import { NotificationPreferenceRepository } from './notification-preference.repository'

class NotificationType extends JsonType {
  convertToJSValue(value: string | null): typeof NOTIFICATION_TYPES | null {
    if (isNil(value)) {
      return value
    }

    return JSON.parse(value)
  }
}

@Entity({ tableName: 'notification_preferences', repository: () => NotificationPreferenceRepository })
export class NotificationPreference {
  @PrimaryKey()
  id: number

  @Property({ type: NotificationType })
  data: typeof NOTIFICATION_TYPES

  @OneToOne({ entity: () => User, serializedName: 'userId' })
  user!: Ref<User>

  constructor(user: User) {
    this.user = Reference.create(user)
    this.data = DEFAULT_NOTIFICATION_PREFERENCES
  }
}
