import { EntityManager, EntityName } from '@mikro-orm/core'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable } from '@nestjs/common'
import { AbstractCountService } from '@shared/domain/counters/abstract-count.service'
import { ScopeFilterProvider } from '@shared/domain/counters/counters.types'
import { Job } from '../job.entity'
import { JobScopeFilterProvider } from '../job-scope-filter.provider'

@Injectable()
export class JobCountService extends AbstractCountService<Job> {
  protected readonly em: EntityManager
  protected readonly scopeFilterProvider: ScopeFilterProvider<Job>
  protected readonly entityClass: EntityName<Job> = Job

  constructor(em: SqlEntityManager, jobScopeFilterProvider: JobScopeFilterProvider) {
    super()
    this.em = em
    this.scopeFilterProvider = jobScopeFilterProvider
  }
}
