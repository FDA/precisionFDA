import { EntityType } from '@shared/domain/entity/domain/entity.type'
import { EntityProvenanceSource } from './entity-provenance-source'

export type EntityProvenanceSourceUnion = {
  [K in EntityType]: EntityProvenanceSource<K>
}[EntityType]
