import { Injectable } from '@nestjs/common'
import { EntityProvenanceDataService } from './entity-provenance-data.service'
import { DbCluster } from '@shared/domain/db-cluster/db-cluster.entity'
import { EntityProvenanceSourceUnion } from '../../model/entity-provenance-source-union'

@Injectable()
export class DBClusterProvenanceDataService extends EntityProvenanceDataService<'dbcluster'> {
  protected type = 'dbcluster' as const

  protected getIdentifier(dbcluster: DbCluster): string {
    return dbcluster.uid
  }

  async getParents(source: DbCluster): Promise<EntityProvenanceSourceUnion[]> {
    const user = await source.user.load()

    return [
      {
        type: 'user',
        entity: user,
      },
    ]
  }

  async getChildren(): Promise<EntityProvenanceSourceUnion[]> {
    return []
  }
}
