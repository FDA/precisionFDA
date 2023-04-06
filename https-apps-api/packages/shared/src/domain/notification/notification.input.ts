import { NOTIFICATION_ACTION, SEVERITY } from '../../../src/enums'

type NotificationInput = {
  id?: number
  action: NOTIFICATION_ACTION
  message: string
  severity: SEVERITY
  deliveredAt?: Date
  userId?: number
}

export { NotificationInput }
