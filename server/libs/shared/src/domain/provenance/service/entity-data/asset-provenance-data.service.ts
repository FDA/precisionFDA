import { Injectable } from '@nestjs/common'
import { EntityProvenanceSourceUnion } from '../../model/entity-provenance-source-union'
import { EntityProvenanceDataService } from './entity-provenance-data.service'

@Injectable()
export class AssetProvenanceDataService extends EntityProvenanceDataService<'asset'> {
  protected type = 'asset' as const

  async getParents(): Promise<EntityProvenanceSourceUnion[]> {
    return []
  }
}
