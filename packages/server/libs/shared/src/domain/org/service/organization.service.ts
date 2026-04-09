import { Injectable } from '@nestjs/common'
import { Logger } from 'nestjs-pino'
import { OrganizationRepository } from '@shared/domain/org/organization.repository'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'

@Injectable()
export class OrganizationService {
  @ServiceLogger()
  protected readonly logger: Logger

  constructor(private readonly orgRepository: OrganizationRepository) {}

  async getStatistics(): Promise<number> {
    return await this.orgRepository.count({})
  }
}
