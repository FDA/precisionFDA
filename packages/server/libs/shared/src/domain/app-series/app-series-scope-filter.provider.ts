import { Injectable } from '@nestjs/common'
import { AbstractScopeFilterProvider } from '@shared/domain/counters/abstract-scope-filter.provider'
import { AppSeries } from './app-series.entity'

/**
 * Scope filter provider for AppSeries entities.
 * Uses standard filtering for all scopes (ME, FEATURED, EVERYBODY, SPACES).
 */
@Injectable()
export class AppSeriesScopeFilterProvider extends AbstractScopeFilterProvider<AppSeries> {}
