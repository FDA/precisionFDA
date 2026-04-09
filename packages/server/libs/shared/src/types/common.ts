import { Uid } from '@shared/domain/entity/domain/uid'

export interface PaginationParams {
  page: number
  limit: number
}

export type SpaceScope = `space-${number}`
export type StaticScope = 'private' | 'public'
export type EntityScope = StaticScope | SpaceScope

export type SCOPE = StaticScope | SpaceScope

export type DnanexusLink = {
  $dnanexus_link: string
}

export type IOType = string[] | number[] | boolean[] | Uid<'file'> | string | number | boolean | Uid<'file'>[]

export type PlatformIOType = string | number | boolean | string[] | number[] | boolean[] | DnanexusLink | DnanexusLink[]
