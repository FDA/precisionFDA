import { Injectable } from '@nestjs/common'
import { config } from '@shared/config'
import { User } from '@shared/domain/user/user.entity'
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
