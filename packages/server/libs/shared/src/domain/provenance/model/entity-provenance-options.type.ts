import { EntityProvenanceFormatType } from './entity-provenance-format.type'
import { EntityProvenanceFormatTypeToConfigMap } from './entity-provenance-format-type-to-config.map'

export type EntityProvenanceOptionsType<T extends EntityProvenanceFormatType> =
  EntityProvenanceFormatTypeToConfigMap[T]['options']
