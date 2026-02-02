import { Injectable } from '@nestjs/common'
import { AbstractScopeFilterProvider } from '@shared/domain/counters/abstract-scope-filter.provider'
import { Job } from './job.entity'

/**
 * Scope filter provider for Job entities.
 * Uses standard filtering for all scopes (ME, FEATURED, EVERYBODY, SPACES).
 */
@Injectable()
export class JobScopeFilterProvider extends AbstractScopeFilterProvider<Job> {}
