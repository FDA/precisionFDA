import { SpaceMembership } from '../spaces/spaces.types'
import { CreateDataPortalRequest, UpdateDataPortalRequest } from './api'

export interface DataPortalMember {
  dxuser: string
  role: SpaceMembership['role']
}

export interface DataPortal {
  id: number
  name: string
  description: string
  urlSlug: string
  sortOrder: number
  cardImageUid: string
  cardImageUrl: string
  cardImageFileName?: string
  status: 'open' | string
  spaceId: number
  hostLeadDxuser: string
  guestLeadDxuser: string
  content: string | null
  editorState: string
  members: DataPortalMember[]
}

export interface CreateDataPortalData {
  dataPortal: CreateDataPortalRequest
  image: File
}

export interface UpdateDataPortalData {
  dataPortal: UpdateDataPortalRequest
  // Space ID in which the image will be uploaded
  spaceId?: number
  image?: File
}
