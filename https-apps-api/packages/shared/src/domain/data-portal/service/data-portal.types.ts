import { STATUS } from '../data-portal.enum'

class CreateResourceResponse {
  id: number
  fileUid: string
}
class FileParam {
  name: string
  description: string
}
class DataPortalParam {
  id: number
  name: string
  description: string
  content: string

  editorState: string
  hostLeadDxuser: string
  guestLeadDxuser: string
  lastUpdated: string
  cardImageUid: string
  cardImageUrl: string
  spaceId: number
  sortOrder: number
  status: STATUS
}

export { DataPortalParam, FileParam, CreateResourceResponse }
