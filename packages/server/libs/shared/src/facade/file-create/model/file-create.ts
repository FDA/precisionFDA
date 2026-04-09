import { DxId } from '@shared/domain/entity/domain/dxid'
import { EntityScope } from '@shared/types/common'

export interface FileCreate {
  project: DxId<'project'>
  name: string
  scope: EntityScope
  description: string
}
