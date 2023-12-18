import { EntityType } from '../../entity'
import { EntityProvenanceData } from './entity-provenance-data'

export type EntityProvenance<T extends EntityType = EntityType> = {
  data: EntityProvenanceData<T>
  parents?: EntityProvenance[]
}
