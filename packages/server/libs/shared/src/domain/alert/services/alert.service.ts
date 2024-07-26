import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable, Logger } from '@nestjs/common'
import { Alert } from '@shared/domain/alert/entity/alert.entity'
import { AlertDTO } from '@shared/domain/alert/dto/AlertDTO'
import { CreateAlertDTO } from '@shared/domain/alert/dto/CreateAlertDTO'
import { NotFoundError } from '@shared/errors'
import { plainToInstance } from 'class-transformer'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'

@Injectable()
export class AlertService {
  @ServiceLogger()
  private readonly logger: Logger
  constructor(private readonly em: SqlEntityManager) {
  }

  async create(alert: CreateAlertDTO): Promise<AlertDTO> {
    const alertEntity = new Alert()
    this.mapToEntity(alertEntity, alert)
    await this.em.persistAndFlush(alertEntity)
    return plainToInstance(AlertDTO, alertEntity)
  }

  async update(id: number, alert: CreateAlertDTO): Promise<AlertDTO> {
    return await this.em.transactional(async () => {
      const alertEntity = await this.em.findOne(Alert, { id })
      if (!alertEntity) {
        throw new NotFoundError('Alert not found')
      }

      this.mapToEntity(alertEntity, alert)
      this.em.persist(alertEntity)
      return plainToInstance(AlertDTO, alertEntity)
    })
  }

  async delete(id: number) {
    return await this.em.transactional(async () => {
      const alert = await this.em.findOne(Alert, id)
      if (!alert) {
        throw new NotFoundError('Alert not found')
      }
      this.logger.log(`Deleting alert with id: ${alert.id}, title: ${alert.title}`)
      this.em.remove(alert)
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

    const alerts = await this.em.find(Alert, conditions)
    return alerts.map((alert) => plainToInstance(AlertDTO, alert))
  }


  private mapToEntity(alertEntity: Alert, alert: CreateAlertDTO) {
    alertEntity.title = alert.title
    alertEntity.content = alert.content
    alertEntity.type = alert.type
    alertEntity.startTime = alert.startTime
    alertEntity.endTime = alert.endTime
  }

}
