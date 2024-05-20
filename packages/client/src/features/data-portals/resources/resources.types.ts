
export interface Resource {
  id: number
  name: string
  url: string
}

export interface RemovePayload {
  portalId: string
  resourceId: number
}