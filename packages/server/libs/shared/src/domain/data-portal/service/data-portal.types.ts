import type { DATA_PORTAL_MEMBER_ROLE, DATA_PORTAL_STATUS } from '../data-portal.enum'

class CreateResourceResponse {
  id: number
  fileUid: string
}
class FileParam {
  name: string
  description: string
}

class DataPortalMemberParam {
  dxuser: string
  role: DATA_PORTAL_MEMBER_ROLE
}
class DataPortalParam {
  id: number
  name: string
  description: string
  urlSlug: string
  content: string
  editorState: string
  hostLeadDxuser: string
  guestLeadDxuser: string
  lastUpdated: string
  cardImageId: number
  cardImageUid: string
  cardImageUrl: string
  spaceId: number
  sortOrder: number
  default: boolean
  status: DATA_PORTAL_STATUS
  members: DataPortalMemberParam[]
}

export { DataPortalParam, FileParam, DataPortalMemberParam, CreateResourceResponse }
