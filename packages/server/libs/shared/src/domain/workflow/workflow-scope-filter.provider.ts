import { Injectable } from '@nestjs/common'
import { AbstractScopeFilterProvider } from '@shared/domain/counters/abstract-scope-filter.provider'
import { Workflow } from './entity/workflow.entity'

/**
 * Scope filter provider for Workflow entities.
 * Uses standard filtering for all scopes (ME, FEATURED, EVERYBODY, SPACES).
 */
@Injectable()
export class WorkflowScopeFilterProvider extends AbstractScopeFilterProvider<Workflow> {}
