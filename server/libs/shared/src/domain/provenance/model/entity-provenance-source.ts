import { EntityType, entityTypeToEntityMap } from '../../entity'

export interface EntityProvenanceSource<T extends EntityType> {
  type: T
  entity: InstanceType<typeof entityTypeToEntityMap[T]>
}
