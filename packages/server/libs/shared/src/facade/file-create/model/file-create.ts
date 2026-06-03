import { DxId } from '@shared/domain/entity/domain/dxid'
import { PARENT_TYPE } from '@shared/domain/user-file/user-file.types'
import { EntityScope } from '@shared/types/common'

export interface FileCreate {
  project: DxId<'project'>
  name: string
  scope: EntityScope
  description: string
  parentType?: PARENT_TYPE
  parentId?: number
  parentFolderId?: number
  scopedParentFolderId?: number
}
