import { EntityType } from '../../entity'
import { EntityProvenanceSource } from './entity-provenance-source'

export type EntityProvenanceSourceUnion = {
  [K in EntityType]: EntityProvenanceSource<K>
}[EntityType]
