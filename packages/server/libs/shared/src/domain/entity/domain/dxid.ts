import { EntityType } from './entity.type'
import { PlatformEntityType } from './platform.entity.type'

export type DxId<ENTITY extends EntityType | PlatformEntityType = EntityType | PlatformEntityType> =
  `${ENTITY}-${string}`
