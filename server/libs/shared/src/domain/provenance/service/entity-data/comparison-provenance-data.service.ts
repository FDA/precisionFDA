import { Injectable } from '@nestjs/common'
import { config } from '../../../..'
import { Comparison } from '../../../comparison'
import { EntityProvenanceData } from '../../model/entity-provenance-data'
import { EntityProvenanceSourceUnion } from '../../model/entity-provenance-source-union'
import { EntityProvenanceDataService } from './entity-provenance-data.service'

@Injectable()
export class ComparisonProvenanceDataService implements EntityProvenanceDataService<'comparison'> {
  getData(comparison: Comparison): EntityProvenanceData<'comparison'> {
    return {
      type: 'comparison',
      url: `${config.api.railsHost}/comparisons/${comparison.id}`,
      title: comparison.name ?? '',
    }
  }

  async getParents(comparison: Comparison): Promise<EntityProvenanceSourceUnion[]> {
    const files = await comparison.inputFiles.loadItems()

    return files.map(f => ({ type: 'file', entity: f }))
  }
}
