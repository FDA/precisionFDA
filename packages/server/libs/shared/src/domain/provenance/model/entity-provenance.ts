import { EntityType } from '@shared/domain/entity/domain/entity.type'
import { EntityProvenanceData } from './entity-provenance-data'

export type EntityProvenance<T extends EntityType = EntityType> = {
  data: EntityProvenanceData<T>
  parents?: EntityProvenance[]
  children?: EntityProvenance[]
}
