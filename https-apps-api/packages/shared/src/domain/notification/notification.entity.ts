import { NOTIFICATION_ACTION, SEVERITY } from 'shared/src/enums'

// TODO to be made entity in near future
export class Notification {
  action: NOTIFICATION_ACTION
  message: string
  severity: SEVERITY
  userId: number
}
