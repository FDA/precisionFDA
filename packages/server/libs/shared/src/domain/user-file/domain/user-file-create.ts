import { DxId } from '@shared/domain/entity/domain/dxid'
import { EntityScope } from '@shared/types/common'
import type { FILE_STATE, PARENT_TYPE } from '../user-file.types'

export interface UserFileCreate {
  dxid: DxId<'file'>
  project: DxId<'project'>
  name: string
  state: FILE_STATE
  description: string
  userId: number
  parentType: PARENT_TYPE
  parentId: number
  scope: EntityScope
  parentFolderId?: number
  scopedParentFolderId?: number
}
