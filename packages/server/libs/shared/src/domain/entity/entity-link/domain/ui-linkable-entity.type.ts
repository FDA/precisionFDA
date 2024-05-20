import { EntityType } from '@shared/domain/entity/domain/entity.type'

export type UiLinkableEntityType = Exclude<EntityType, 'resource'>
