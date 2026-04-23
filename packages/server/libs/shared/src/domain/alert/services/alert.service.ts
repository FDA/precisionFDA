import { Injectable, Logger } from '@nestjs/common'
import { AlertRepository } from '@shared/domain/alert/alert.repository'
import { AlertDTO } from '@shared/domain/alert/dto/AlertDTO'
import { CreateAlertDTO } from '@shared/domain/alert/dto/CreateAlertDTO'
import { Alert } from '@shared/domain/alert/entity/alert.entity'
import { NotFoundError } from '@shared/errors'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'

@Injectable()
export class AlertService {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(private readonly repo: AlertRepository) {}

  async create(alert: CreateAlertDTO): Promise<AlertDTO> {
    const alertEntity = new Alert()
    this.mapToEntity(alertEntity, alert)
    await this.repo.persistAndFlush(alertEntity)
    return AlertDTO.fromEntity(alertEntity)
  }

  async update(id: number, alert: CreateAlertDTO): Promise<AlertDTO> {
    return this.repo.transactional(async () => {
      const alertEntity = await this.repo.findOne({ id })
      if (!alertEntity) {
        throw new NotFoundError('Alert not found')
      }

      this.mapToEntity(alertEntity, alert)
      this.repo.persist(alertEntity)
      return AlertDTO.fromEntity(alertEntity)
    })
  }

  async delete(id: number): Promise<number> {
    return this.repo.transactional(async () => {
      const alert = await this.repo.findOne(id)
      if (!alert) {
        throw new NotFoundError('Alert not found')
      }
      this.logger.log(`Deleting alert with id: ${alert.id}, title: ${alert.title}`)
      this.repo.remove(alert)
      return alert.id
    })
  }

  async getAll(active: boolean | undefined): Promise<AlertDTO[]> {
    let conditions = {}

    if (active !== undefined) {
      const now = new Date()
      if (active) {
        conditions = { startTime: { $lte: now }, endTime: { $gte: now } }
      } else {
        conditions = {
          $or: [{ startTime: { $gt: now } }, { endTime: { $lt: now } }],
        }
      }
    }

    const alerts = await this.repo.find(conditions)
    return alerts.map(AlertDTO.fromEntity)
  }

  private mapToEntity(alertEntity: Alert, alert: CreateAlertDTO): void {
    alertEntity.title = alert.title
    alertEntity.content = alert.content
    alertEntity.type = alert.type
    alertEntity.startTime = alert.startTime
    alertEntity.endTime = alert.endTime
  }
}
