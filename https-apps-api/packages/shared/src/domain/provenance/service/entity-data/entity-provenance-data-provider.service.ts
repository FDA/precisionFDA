import { SqlEntityManager } from '@mikro-orm/mysql'
import { ArrayUtils } from '../../../../utils'
import { EntityType } from '../../../entity'
import { EntityProvenance } from '../../model/entity-provenance'
import { EntityProvenanceSourceUnion } from '../../model/entity-provenance-source-union'
import { AppProvenanceDataService } from './app-provenance-data.service'
import { AssetProvenanceDataService } from './asset-provenance-data.service'
import { ComparisonProvenanceDataService } from './comparison-provenance-data.service'
import { EntityProvenanceDataService } from './entity-provenance-data.service'
import { FileProvenanceDataService } from './file-provenance-data.service'
import { JobProvenanceDataService } from './job-provenance-data.service'
import { UserProvenanceDataService } from './user-provenance-data.service'

export class EntityProvenanceDataProviderService {
  private readonly ENTITY_TYPE_TO_PARENT_RESOLVER_MAP: { [T in EntityType]: EntityProvenanceDataService<T> }

  constructor(em: SqlEntityManager) {
    this.ENTITY_TYPE_TO_PARENT_RESOLVER_MAP = {
      file: new FileProvenanceDataService(em),
      job: new JobProvenanceDataService(),
      user: new UserProvenanceDataService(),
      comparison: new ComparisonProvenanceDataService(),
      asset: new AssetProvenanceDataService(),
      app: new AppProvenanceDataService(),
    }
  }

  async getEntityProvenanceData(source: EntityProvenanceSourceUnion): Promise<EntityProvenance> {
    const dataService: EntityProvenanceDataService<typeof source.type> = this.ENTITY_TYPE_TO_PARENT_RESOLVER_MAP[source.type]

    const result: EntityProvenance = {
      data: dataService.getData(source.entity),
    }

    const parents = await dataService.getParents(source.entity)
    if (!ArrayUtils.isEmpty(parents)) {
      result.parents = await Promise.all(parents.map(p => this.getEntityProvenanceData(p)))
    }

    return result
  }
}
