import { EntityWithIconType } from '@shared/domain/entity/entity-icon/entity-with-icon.type'
import { EntityProvenanceData } from './entity-provenance-data'

export type EntityProvenance<T extends EntityWithIconType = EntityWithIconType> = {
  data: EntityProvenanceData<T>
  parents?: EntityProvenance[]
  children?: EntityProvenance[]
}
