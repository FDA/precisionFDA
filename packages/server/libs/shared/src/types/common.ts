import { STATIC_SCOPE } from '../enums'

export interface PaginationParams {
  page: number
  limit: number
}

export type SpaceScope = `space-${number}`
export type StaticScope = 'private' | 'public'
export type EntityScope = StaticScope | SpaceScope

export type SCOPE = STATIC_SCOPE | SpaceScope

export type DnanexusLink = {
  $dnanexus_link: string
}

export type IOType = | string[]
  | number[]
  | boolean[]
  | DnanexusLink
  | string
  | number
  | boolean
  | DnanexusLink[]
