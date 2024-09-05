import { IsValidScope } from '@shared/domain/entity/constraint/is-valid-scope.constraint'
import { IsSpaceReportOptionsValid } from '@shared/domain/space-report/constraint/is-space-report-options-valid.constraint'
import {
  allowedSpaceReportFormats,
  SpaceReportFormat,
} from '@shared/domain/space-report/model/space-report-format'
import { SpaceReportFormatToOptionsMap } from '@shared/domain/space-report/model/space-report-format-to-options.map'
import { EntityScope } from '@shared/types/common'
import { IsIn } from 'class-validator'

export class SpaceReportCreateDto<T extends SpaceReportFormat = SpaceReportFormat> {
  @IsValidScope({ allowPublic: false })
  scope: EntityScope
  @IsIn(allowedSpaceReportFormats)
  format: T
  @IsSpaceReportOptionsValid()
  options?: SpaceReportFormatToOptionsMap[T]
}
