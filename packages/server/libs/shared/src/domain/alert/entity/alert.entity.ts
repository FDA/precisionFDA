import { Entity, Property } from '@mikro-orm/core'
import { BaseEntity } from '@shared/database/base-entity'

export const alertTypes = ['info', 'warning', 'danger'] as const
export type AlertType = (typeof alertTypes)[number]

@Entity({ tableName: 'alerts' })
export class Alert extends BaseEntity {
  @Property({ nullable: false })
  title: string

  @Property({ nullable: false })
  content: string

  @Property({ columnType: 'text', nullable: false })
  type: AlertType

  @Property({ nullable: false })
  startTime: Date

  @Property({ nullable: false })
  endTime: Date
}
