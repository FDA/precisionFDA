import { NOTIFICATION_ACTION, SEVERITY } from '@shared/enums'
import { NotificationMeta } from './notification.entity'

export type NotificationInput = {
  id?: number
  action: NOTIFICATION_ACTION
  message: string
  sessionId?: string
  meta?: NotificationMeta
  severity: SEVERITY
  deliveredAt?: Date
  userId?: number
}
