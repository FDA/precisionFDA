import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable } from '@nestjs/common'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { Logger } from 'nestjs-pino'
import { OrganizationRepository } from '@shared/domain/org/organization.repository'

@Injectable()
export class OrganizationService {
  @ServiceLogger()
  protected readonly logger: Logger

  constructor(
    private readonly em: SqlEntityManager,
    private readonly orgRepository: OrganizationRepository,
  ) {}

  async getStatistics(): Promise<number> {
    return await this.orgRepository.count({})
  }
}
