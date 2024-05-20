import { EntityInstance } from '@shared/domain/entity/domain/entity-instance'
import { EntityWithProvenanceType } from '@shared/domain/provenance/model/entity-with-provenance.type'

export interface EntityProvenanceSource<T extends EntityWithProvenanceType> {
  type: T
  entity: EntityInstance<T>
}
