
export interface Resource {
  id: number
  name: string
  url: string
  isDeleting?: boolean
}

export interface RemovePayload {
  portalId: string
  resourceId: number
}