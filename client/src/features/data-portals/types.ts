import { SpaceMembership } from '../spaces/spaces.types'

export interface DataPortalMember {
  dxuser: string
  role: SpaceMembership['role']
}

export interface DataPortal {
  id: number
  name: string
  description: string
  sortOrder: number
  cardImageUid: string
  cardImageUrl: string
  status: 'open' | string
  spaceId: number
  hostLeadDxuser: string
  guestLeadDxuser: string
  content: string | null
  editorState: string
  members: DataPortalMember[]
}
