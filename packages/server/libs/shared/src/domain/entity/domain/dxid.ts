import { EntityType } from './entity.type'
import { PlatformEntityType } from './platform.entity.type'

export const DXEntities = ['app', 'dbcluster', 'file', 'job', 'workflow'] as const

export type DXEntityType = Extract<EntityType, (typeof DXEntities)[number]>

export type DxId<
  ENTITY extends DXEntityType | PlatformEntityType = DXEntityType | PlatformEntityType,
> = `${ENTITY}-${string}`
