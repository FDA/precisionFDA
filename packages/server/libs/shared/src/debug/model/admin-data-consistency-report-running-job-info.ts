import { DxId } from '@shared/domain/entity/domain/dxid'
import { Uid } from '@shared/domain/entity/domain/uid'
import { EntityScope } from '@shared/types/common'

export interface AdminDataConsistencyReportRunningJobInfo {
  dxid: DxId<'job'>
  id: number
  uid: Uid<'job'>
  userId: number
  userDxid: DxId<'user'>
  scope: EntityScope
  entityType: string
  elapsedTime: string
}
