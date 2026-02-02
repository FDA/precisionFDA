import { FilterQuery } from '@mikro-orm/core'
import { Injectable } from '@nestjs/common'
import { STATIC_SCOPE } from '@shared/enums'
import { AbstractScopeFilterProvider } from '@shared/domain/counters/abstract-scope-filter.provider'
import { ScopeFilterContext } from '@shared/domain/counters/counters.types'
import { Discussion } from './discussion.entity'

/**
 * Scope filter provider for Discussion entities.
 * Discussions use the note's scope for filtering and don't have a 'me' scope.
 */
@Injectable()
export class DiscussionScopeFilterProvider extends AbstractScopeFilterProvider<Discussion> {
  protected override buildMeCondition(
    _context: ScopeFilterContext,
  ): FilterQuery<Discussion> | null {
    return null
  }

  protected override buildFeaturedCondition(
    _context: ScopeFilterContext,
  ): FilterQuery<Discussion> | null {
    return {
      note: { scope: STATIC_SCOPE.PUBLIC },
    }
  }

  protected override buildEverybodyCondition(
    _context: ScopeFilterContext,
  ): FilterQuery<Discussion> | null {
    return {
      note: { scope: STATIC_SCOPE.PUBLIC },
    }
  }

  protected override buildSpacesCondition(
    context: ScopeFilterContext,
  ): FilterQuery<Discussion> | null {
    const { spaceScopes } = context
    if (spaceScopes.length === 0) return null
    return {
      note: { scope: { $in: spaceScopes } },
    }
  }
}
