import { AlertType } from '@shared/domain/alert/entity/alert.entity'

export class AlertDTO {
  id: number
  title: string
  content: string
  type: AlertType
  startTime: Date
  endTime: Date
}
