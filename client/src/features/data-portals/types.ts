export interface DataPortal {
  id: number
  name: string
  description: string
  sortOrder: number
  cardImageUid: string
  cardImageUrl: string
  status: 'open' | string
  spaceId: number
  hostLeadDxUser: string
  guestLeadDxUser: string
  content: string | null
  editorState: string
}
