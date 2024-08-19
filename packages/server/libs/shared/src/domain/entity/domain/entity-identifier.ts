import { DXEnityType } from './dxid'
import { EntityType } from './entity.type'
import { Uid } from './uid'

export type NonDXEntity = Exclude<EntityType, DXEnityType>

export type EntityIdentifier = Uid | `${NonDXEntity}-${string}`
