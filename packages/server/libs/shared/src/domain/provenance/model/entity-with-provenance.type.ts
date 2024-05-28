import { EntityType } from '@shared/domain/entity/domain/entity.type'

export type EntityWithProvenanceType = Exclude<EntityType, 'discussion' | 'resource' | 'folder'>
