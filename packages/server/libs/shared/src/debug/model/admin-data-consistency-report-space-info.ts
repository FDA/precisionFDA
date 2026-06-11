import { DxId } from '@shared/domain/entity/domain/dxid'
import { SPACE_STATE } from '@shared/domain/space/space.enum'

export interface AdminDataConsistencyReportSpaceInfo {
  id: number
  name: string
  spaceType: string
  spaceId: number
  state: SPACE_STATE
  hostDxOrg: DxId<'org'>
  hostLead: string
  guestDxOrg: DxId<'org'>
  guestLead: string
  status: string
}
