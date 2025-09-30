import { EntityType } from './entity.type'
import { Uid, UidAbleEntityType } from './uid'

export type NonUidEntity = Exclude<EntityType, UidAbleEntityType>

export type EntityIdentifier = Uid | `${NonUidEntity}-${number}`
