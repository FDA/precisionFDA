/* eslint-disable max-classes-per-file */
import {
  Entity,
  IdentifiedReference,
  JsonType,
  OneToOne,
  PrimaryKey,
  Property,
  Reference,
} from '@mikro-orm/core'
import { isNil } from 'ramda'
import { User } from '..'
import { NOTIFICATION_TYPES } from './email.config'

class NotificationType extends JsonType {
  convertToJSValue(value: string | null): typeof NOTIFICATION_TYPES | null {
    if (isNil(value)) {
      return value
    }

    return JSON.parse(value)
  }
  // todo: make sure db conversion works well too
}

@Entity({ tableName: 'notification_preferences' })
export class EmailNotification {
  @PrimaryKey()
  id: number

  @OneToOne({ fieldName: 'user_id', entity: () => User })
  user!: IdentifiedReference<User>

  @Property({ type: NotificationType })
  data: typeof NOTIFICATION_TYPES

  constructor({ user }: { user: User }) {
    this.user = Reference.create(user)
  }
}
