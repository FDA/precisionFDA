import {
  SPACE_MEMBERSHIP_ROLE,
  SPACE_MEMBERSHIP_SIDE,
} from '@shared/domain/space-membership/space-membership.enum'
import { SpaceReportPartResultBase } from '@shared/domain/space-report/model/space-report-part-result-base'

export interface SpaceReportPartUserTileBaseResult extends SpaceReportPartResultBase {
  memberSince: Date
  dxuser: string
  link: string
}

export interface SpaceReportPartUserTileHtmlResult extends SpaceReportPartUserTileBaseResult {
  role: SPACE_MEMBERSHIP_ROLE
  side?: SPACE_MEMBERSHIP_SIDE
}

export interface SpaceReportPartUserTileJsonResult extends SpaceReportPartUserTileBaseResult {
  role: string
  side?: string
}
