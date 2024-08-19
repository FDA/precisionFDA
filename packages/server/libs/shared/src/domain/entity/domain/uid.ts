import { DXEnityType, DxId } from './dxid'
import { PlatformEntityType } from './platform.entity.type'

export type Uid<
  ENTITY extends DXEnityType | PlatformEntityType = DXEnityType | PlatformEntityType,
> = `${DxId<ENTITY>}-${number}`
