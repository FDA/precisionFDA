import { EntityScope } from '@shared/types/common'
import { DxId } from '@shared/domain/entity/domain/dxid'

export interface FileCreate {
  project: DxId<'project'>
  name: string
  scope: EntityScope
  description: string
}
