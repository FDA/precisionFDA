import { Injectable } from '@nestjs/common'
import { config } from '../../../..'
import { User } from '../../../user'
import { EntityProvenanceData } from '../../model/entity-provenance-data'
import { EntityProvenanceSourceUnion } from '../../model/entity-provenance-source-union'
import { EntityProvenanceDataService } from './entity-provenance-data.service'

@Injectable()
export class UserProvenanceDataService implements EntityProvenanceDataService<'user'> {
  getData(user: User): EntityProvenanceData<'user'> {
    return {
      type: 'user',
      url: `${config.api.railsHost}/users/${user.dxuser}`,
      title: user.fullName,
    }
  }

  async getParents(): Promise<EntityProvenanceSourceUnion[]> {
    return []
  }
}
