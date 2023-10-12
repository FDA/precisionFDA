import { EntityProvenanceFormatTypeToResultTypeMap } from './entity-provenance-format'
import { EntityProvenanceFormatType } from './entity-provenance-format.type'

export type EntityProvenanceResultType<T extends EntityProvenanceFormatType> = EntityProvenanceFormatTypeToResultTypeMap[T]
