import { DxId } from './dxid'
import { EntityType } from './entity.type'
import { PlatformEntityType } from './platform.entity.type'

export type UId<ENTITY extends EntityType | PlatformEntityType> = `${DxId<ENTITY>}-${number}`
