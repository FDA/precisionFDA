import { EntityType } from '@shared/domain/entity/domain/entity.type'

export type EntityIconType = Exclude<EntityType, 'resource' | 'discussion' | 'answer' | 'comment'>
