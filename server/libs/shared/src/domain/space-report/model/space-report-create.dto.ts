import { IsSpaceReportOptionsValid } from '@shared/domain/space-report/constraint/is-space-report-options-valid.constraint'
import {
  allowedSpaceReportFormats,
  SpaceReportFormat,
} from '@shared/domain/space-report/model/space-report-format'
import { SpaceReportFormatToOptionsMap } from '@shared/domain/space-report/model/space-report-format-to-options.map'
import { IsIn } from 'class-validator'

export class SpaceReportCreateDto<T extends SpaceReportFormat = SpaceReportFormat> {
  @IsIn(allowedSpaceReportFormats)
  format: T
  @IsSpaceReportOptionsValid()
  options?: SpaceReportFormatToOptionsMap[T]
}
