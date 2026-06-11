import { FILE_STATE, FILE_STI_TYPE } from '@shared/domain/user-file/user-file.types'
import { EntityScope } from '@shared/types/common'

export interface AdminDataConsistencyReportNodeWithParent {
  id: number
  name: string
  parentFolderId: number
  scopedParentFolderId: number
  scope: EntityScope
  state: FILE_STATE
  stiType: FILE_STI_TYPE
  errors: string
}
