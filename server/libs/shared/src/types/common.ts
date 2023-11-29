import { STATIC_SCOPE } from '../enums'

export interface PaginationParams {
  page: number
  limit: number
}

export type SCOPE = STATIC_SCOPE | `space-${string}`

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
