import { Injectable } from '@nestjs/common'
import { Comparison } from '@shared/domain/comparison/comparison.entity'
import { EntityProvenanceSourceUnion } from '../../model/entity-provenance-source-union'
import { EntityProvenanceDataService } from './entity-provenance-data.service'

@Injectable()
export class ComparisonProvenanceDataService extends EntityProvenanceDataService<'comparison'> {
  protected type = 'comparison' as const

  protected getIdentifier(comparison: Comparison): string {
    return String(comparison.id)
  }

  async getParents(comparison: Comparison): Promise<EntityProvenanceSourceUnion[]> {
    const files = await comparison.inputFiles.loadItems()

    return files.map((f) => ({ type: 'file', entity: f }))
  }
}
