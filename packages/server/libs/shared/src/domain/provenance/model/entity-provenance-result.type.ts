import { EntityProvenanceFormatType } from './entity-provenance-format.type'
import { EntityProvenanceFormatTypeToConfigMap } from './entity-provenance-format-type-to-config.map'

export type EntityProvenanceResultType<T extends EntityProvenanceFormatType> =
  EntityProvenanceFormatTypeToConfigMap[T]['returnType']
