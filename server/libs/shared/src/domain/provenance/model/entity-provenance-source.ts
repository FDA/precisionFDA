import { entityTypeToEntityMap } from '@shared/domain/entity/domain/entity-type-to-entity.map'
import { EntityType } from '@shared/domain/entity/domain/entity.type'

export interface EntityProvenanceSource<T extends EntityType> {
  type: T
  entity: InstanceType<typeof entityTypeToEntityMap[T]>
}
