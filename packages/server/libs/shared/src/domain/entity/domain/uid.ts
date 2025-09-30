import { DXEntityType, DxId } from './dxid'

export type UidAbleEntityType = DXEntityType

export type Uid<ENTITY extends UidAbleEntityType = UidAbleEntityType> = `${DxId<ENTITY>}-${number}`
