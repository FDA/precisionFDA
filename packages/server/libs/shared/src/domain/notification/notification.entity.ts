import { Entity, Ref, ManyToOne, PrimaryKey, Property, Reference } from '@mikro-orm/core'
import { User } from '@shared/domain/user/user.entity'
import { BaseEntity } from '../../database/base-entity'
import { NOTIFICATION_ACTION, SEVERITY } from '../../enums'

export type NotificationMeta = {
  linkTitle?: string
  linkUrl?: string
}

@Entity({ tableName: 'notifications' })
export class Notification extends BaseEntity {
  @PrimaryKey()
  id: number

  @Property()
  action: NOTIFICATION_ACTION

  @Property()
  message: string

  @Property()
  severity: SEVERITY

  @Property()
  userId: number

  @Property({ type: 'json', nullable: true })
  meta?: NotificationMeta

  @Property()
  deliveredAt?: Date

  @ManyToOne(() => User)
  user?: Ref<User>

  constructor(
    user: Ref<User> | null,
    action?: NOTIFICATION_ACTION,
    message?: string,
    severity?: SEVERITY,
    createdAt?: Date,
    updatedAt?: Date,
    meta?: NotificationMeta,
  ) {
    super()
    if (user !== null) {
      this.user = user
    }
    if (action) this.action = action
    if (message) this.message = message
    if (severity) this.severity = severity
    if (createdAt) this.createdAt = createdAt
    if (updatedAt) this.updatedAt = updatedAt
    if (meta) this.meta = meta
  }
}
