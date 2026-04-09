import { EntityType } from '@shared/domain/entity/domain/entity.type'
import { entityTypeToEntityMap } from '@shared/domain/entity/domain/entity-type-to-entity.map'

export type EntityInstance<T extends EntityType> = InstanceType<(typeof entityTypeToEntityMap)[T]>
