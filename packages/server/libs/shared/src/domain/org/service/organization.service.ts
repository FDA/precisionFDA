import { Injectable } from '@nestjs/common'
import { OrganizationRepository } from '@shared/domain/org/organization.repository'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { Logger } from 'nestjs-pino'

@Injectable()
export class OrganizationService {
  @ServiceLogger()
  protected readonly logger: Logger

  constructor(
    private readonly orgRepository: OrganizationRepository,
  ) {}

  async getStatistics(): Promise<number> {
    return await this.orgRepository.count({})
  }
}
