import { Injectable } from '@nestjs/common'
import { Asset } from '@shared/domain/user-file/asset.entity'
import { EntityProvenanceSourceUnion } from '../../model/entity-provenance-source-union'
import { EntityProvenanceDataService } from './entity-provenance-data.service'

@Injectable()
export class AssetProvenanceDataService extends EntityProvenanceDataService<'asset'> {
  protected type = 'asset' as const

  protected getIdentifier(asset: Asset): string {
    return asset.uid
  }
  async getParents(): Promise<EntityProvenanceSourceUnion[]> {
    return []
  }

  async getChildren(): Promise<EntityProvenanceSourceUnion[]> {
    return []
  }
}
