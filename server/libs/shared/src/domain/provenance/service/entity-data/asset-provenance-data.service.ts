import { Injectable } from '@nestjs/common'
import { config } from '../../../..'
import { Asset } from '../../../user-file'
import { EntityProvenanceData } from '../../model/entity-provenance-data'
import { EntityProvenanceSourceUnion } from '../../model/entity-provenance-source-union'
import { EntityProvenanceDataService } from './entity-provenance-data.service'

@Injectable()
export class AssetProvenanceDataService implements EntityProvenanceDataService<'asset'> {
  getData(asset: Asset): EntityProvenanceData<'asset'> {
    return {
      type: 'asset',
      url: `${config.api.railsHost}/home/assets/${asset.uid}`,
      title: asset.name,
    }
  }

  async getParents(): Promise<EntityProvenanceSourceUnion[]> {
    return []
  }
}
