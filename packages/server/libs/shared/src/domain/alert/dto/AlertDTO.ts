import { Alert, AlertType } from '@shared/domain/alert/entity/alert.entity'

export class AlertDTO {
  id: number
  title: string
  content: string
  type: AlertType
  startTime: Date
  endTime: Date

  static fromEntity(alert: Alert): AlertDTO {
    const dto = new AlertDTO()
    dto.id = alert.id
    dto.title = alert.title
    dto.content = alert.content
    dto.type = alert.type
    dto.startTime = alert.startTime
    dto.endTime = alert.endTime
    return dto
  }
}
