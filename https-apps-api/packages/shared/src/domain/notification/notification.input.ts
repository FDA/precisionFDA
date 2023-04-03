import { NOTIFICATION_ACTION, SEVERITY } from 'shared/src/enums'

type NotificationInput = {
  action: NOTIFICATION_ACTION
  message: string
  severity: SEVERITY
  userId: number
}

export { NotificationInput }
