import { EntityProvenanceData } from './entity-provenance-data'
import { EntityIconType } from '@shared/domain/entity/entity-icon/entity-icon.type'

export type EntityProvenance<T extends EntityIconType = EntityIconType> = {
  data: EntityProvenanceData<T>
  parents?: EntityProvenance[]
  children?: EntityProvenance[]
}
