import { FilterQuery } from '@mikro-orm/core'
import { Injectable } from '@nestjs/common'
import { AbstractScopeFilterProvider } from '@shared/domain/counters/abstract-scope-filter.provider'
import { ScopeFilterContext } from '@shared/domain/counters/counters.types'
import { STATIC_SCOPE } from '@shared/enums'
import { SpaceReport } from './entity/space-report.entity'

/**
 * Scope filter provider for SpaceReport entities.
 * In ME scope, reports are private to the user who created them.
 * In SPACES scope, reports are filtered by the space scopes (inherits base class behavior).
 */
@Injectable()
export class SpaceReportScopeFilterProvider extends AbstractScopeFilterProvider<SpaceReport> {
  protected override buildMeCondition(context: ScopeFilterContext): FilterQuery<SpaceReport> | null {
    return {
      createdBy: context.user.id,
      scope: STATIC_SCOPE.PRIVATE,
    }
  }

  protected override buildFeaturedCondition(_context: ScopeFilterContext): FilterQuery<SpaceReport> | null {
    return null
  }

  protected override buildEverybodyCondition(_context: ScopeFilterContext): FilterQuery<SpaceReport> | null {
    return null
  }
}
