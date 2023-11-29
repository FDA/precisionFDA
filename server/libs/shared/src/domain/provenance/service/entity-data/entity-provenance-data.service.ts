import { EntityType } from '../../../entity'
import { EntityProvenanceData } from '../../model/entity-provenance-data'
import { EntityProvenanceSource } from '../../model/entity-provenance-source'
import { EntityProvenanceSourceUnion } from '../../model/entity-provenance-source-union'

export interface EntityProvenanceDataService<T extends EntityType> {
  getData(source: EntityProvenanceSource<T>['entity']): EntityProvenanceData<T>
  getParents(source: EntityProvenanceSource<T>['entity']): Promise<EntityProvenanceSourceUnion[]>
}
