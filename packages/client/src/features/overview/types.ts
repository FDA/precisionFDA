export interface Org {
  id: number
  title: string | null
  imageUrl: string | null
  public?: boolean | null
  kind: string | null
  position: number | null
  createdAt: Date
  updatedAt: Date
}

export interface ParticipantsResponse {
  orgs: Org[]
}
