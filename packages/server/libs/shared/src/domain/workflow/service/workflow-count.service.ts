import { Injectable } from '@nestjs/common'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { EntityManager, EntityName } from '@mikro-orm/core'
import { AbstractCountService } from '@shared/domain/counters/abstract-count.service'
import { ScopeFilterProvider } from '@shared/domain/counters/counters.types'
import { Workflow } from '../entity/workflow.entity'
import { WorkflowScopeFilterProvider } from '../workflow-scope-filter.provider'

@Injectable()
export class WorkflowCountService extends AbstractCountService<Workflow> {
  protected readonly em: EntityManager
  protected readonly scopeFilterProvider: ScopeFilterProvider<Workflow>
  protected readonly entityClass: EntityName<Workflow> = Workflow

  constructor(em: SqlEntityManager, workflowScopeFilterProvider: WorkflowScopeFilterProvider) {
    super()
    this.em = em
    this.scopeFilterProvider = workflowScopeFilterProvider
  }
}
