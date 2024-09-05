import { EntityProvenanceFormatTypeToConfigMap } from './entity-provenance-format-type-to-config.map'
import { EntityProvenanceFormatType } from './entity-provenance-format.type'

export type EntityProvenanceResultType<T extends EntityProvenanceFormatType> =
  EntityProvenanceFormatTypeToConfigMap[T]['returnType']
