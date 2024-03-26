import { Injectable } from '@nestjs/common'
import { EntityProvenanceSourceUnion } from '../../model/entity-provenance-source-union'
import { EntityProvenanceDataService } from './entity-provenance-data.service'

@Injectable()
export class UserProvenanceDataService extends EntityProvenanceDataService<'user'> {
  protected type = 'user' as const

  async getParents(): Promise<EntityProvenanceSourceUnion[]> {
    return []
  }
}
