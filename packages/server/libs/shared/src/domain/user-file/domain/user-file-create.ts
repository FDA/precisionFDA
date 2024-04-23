import { SCOPE } from '../../../types/common'
import type { FILE_STATE, PARENT_TYPE } from '../user-file.types'

export interface UserFileCreate {
  dxid: string
  project: string
  name: string
  state: FILE_STATE
  description: string
  userId: number
  parentType: PARENT_TYPE
  parentId: number
  scope: SCOPE
  parentFolderId?: number
  scopedParentFolderId?: number
}
