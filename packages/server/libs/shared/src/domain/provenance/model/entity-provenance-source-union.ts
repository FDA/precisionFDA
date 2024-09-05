import { EntityWithProvenanceType } from '@shared/domain/provenance/model/entity-with-provenance.type'
import { EntityProvenanceSource } from './entity-provenance-source'

export type EntityProvenanceSourceUnion = {
  [K in EntityWithProvenanceType]: EntityProvenanceSource<K>
}[EntityWithProvenanceType]
