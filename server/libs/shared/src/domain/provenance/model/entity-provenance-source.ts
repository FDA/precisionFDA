import { entityTypeToEntityMap } from '@shared/domain/entity/domain/entity-type-to-entity.map'
import { EntityWithProvenanceType } from '@shared/domain/provenance/model/entity-with-provenance.type'

export interface EntityProvenanceSource<T extends EntityWithProvenanceType> {
  type: T
  entity: InstanceType<(typeof entityTypeToEntityMap)[T]>
}
