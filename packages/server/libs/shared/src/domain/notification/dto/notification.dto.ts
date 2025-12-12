import { Notification, NotificationMeta } from '@shared/domain/notification/notification.entity'
import { SEVERITY } from '@shared/enums'

export class NotificationDTO {
  id: number
  createdAt: Date
  updatedAt: Date
  deliveredAt: Date | null
  action: string
  message: string
  severity: SEVERITY
  meta?: NotificationMeta

  static fromEntity(notification: Notification): NotificationDTO {
    const dto = new NotificationDTO()
    dto.id = notification.id
    dto.createdAt = notification.createdAt
    dto.updatedAt = notification.updatedAt
    dto.action = notification.action
    dto.message = notification.message
    dto.severity = notification.severity
    dto.meta = notification.meta
    dto.deliveredAt = notification.deliveredAt
    return dto
  }
}
