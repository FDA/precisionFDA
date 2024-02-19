import { SpaceReportPartSourceType } from '@shared/domain/space-report/model/space-report-part-source.type'
import { SpaceReportPartTypeToResultMap } from '@shared/domain/space-report/model/space-report-part-type-to-result.map'

export type SpaceReportPartResult<T extends SpaceReportPartSourceType> =
  SpaceReportPartTypeToResultMap[T]
