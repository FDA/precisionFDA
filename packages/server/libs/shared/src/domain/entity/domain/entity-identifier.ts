import { DXEnityType } from './dxid'
import { EntityType } from './entity.type'
import { UId } from './uid'

export type NonDXEntity = Exclude<EntityType, DXEnityType>

export type EntityIdentifier = UId | `${NonDXEntity}-${string}`
