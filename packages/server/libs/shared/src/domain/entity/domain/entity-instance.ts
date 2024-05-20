import { entityTypeToEntityMap } from '@shared/domain/entity/domain/entity-type-to-entity.map'
import { EntityType } from '@shared/domain/entity/domain/entity.type'

export type EntityInstance<T extends EntityType> = InstanceType<(typeof entityTypeToEntityMap)[T]>
