import {
  SPACE_MEMBERSHIP_ROLE,
  SPACE_MEMBERSHIP_SIDE,
} from '@shared/domain/space-membership/space-membership.enum'
import { SpaceReportPartResultBase } from '@shared/domain/space-report/model/space-report-part-result-base'

export interface SpaceReportPartUserTileResult extends SpaceReportPartResultBase {
  memberSince: Date
  role: SPACE_MEMBERSHIP_ROLE
  dxuser: string
  link: string
  side?: SPACE_MEMBERSHIP_SIDE
}
