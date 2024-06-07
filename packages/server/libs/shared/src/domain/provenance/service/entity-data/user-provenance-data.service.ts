import { Injectable } from '@nestjs/common'
import { User } from '@shared/domain/user/user.entity'
import { EntityProvenanceSourceUnion } from '../../model/entity-provenance-source-union'
import { EntityProvenanceDataService } from './entity-provenance-data.service'

@Injectable()
export class UserProvenanceDataService extends EntityProvenanceDataService<'user'> {
  protected type = 'user' as const

  protected getIdentifier(user: User): string {
    return user.dxuser
  }

  async getParents(): Promise<EntityProvenanceSourceUnion[]> {
    return []
  }

  async getChildren(): Promise<EntityProvenanceSourceUnion[]> {
    return []
  }
}
