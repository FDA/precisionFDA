import { DxId } from '@shared/domain/entity/domain/dxid'
import { EntityScope } from '@shared/types/common'
import type { FILE_STATE } from '../user-file.types'

export interface AssetCreate {
  dxid: DxId<'file'>
  project: DxId<'project'>
  name: string
  state: FILE_STATE
  description: string
  userId: number
  scope: EntityScope
}
