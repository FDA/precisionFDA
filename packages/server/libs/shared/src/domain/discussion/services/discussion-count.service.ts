import { EntityManager, EntityName } from '@mikro-orm/core'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable } from '@nestjs/common'
import { AbstractCountService } from '@shared/domain/counters/abstract-count.service'
import { ScopeFilterProvider } from '@shared/domain/counters/counters.types'
import { Discussion } from '../discussion.entity'
import { DiscussionScopeFilterProvider } from '../discussion-scope-filter.provider'

@Injectable()
export class DiscussionCountService extends AbstractCountService<Discussion> {
  protected readonly em: EntityManager
  protected readonly scopeFilterProvider: ScopeFilterProvider<Discussion>
  protected readonly entityClass: EntityName<Discussion> = Discussion

  constructor(em: SqlEntityManager, discussionScopeFilterProvider: DiscussionScopeFilterProvider) {
    super()
    this.em = em
    this.scopeFilterProvider = discussionScopeFilterProvider
  }
}
