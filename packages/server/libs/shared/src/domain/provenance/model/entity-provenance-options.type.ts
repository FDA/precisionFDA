import { EntityProvenanceFormatTypeToConfigMap } from './entity-provenance-format-type-to-config.map'
import { EntityProvenanceFormatType } from './entity-provenance-format.type'

export type EntityProvenanceOptionsType<T extends EntityProvenanceFormatType> =
  EntityProvenanceFormatTypeToConfigMap[T]['options']
