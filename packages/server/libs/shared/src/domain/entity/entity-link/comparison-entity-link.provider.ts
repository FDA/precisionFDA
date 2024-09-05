import { Injectable } from '@nestjs/common'
import { Comparison } from '@shared/domain/comparison/comparison.entity'
import { EntityLinkProvider } from '@shared/domain/entity/entity-link/entity-link.provider'

@Injectable()
export class ComparisonEntityLinkProvider extends EntityLinkProvider<'comparison'> {
  protected async getRelativeLink(comparison: Comparison) {
    return `/comparisons/${comparison.id}` as const
  }
}
