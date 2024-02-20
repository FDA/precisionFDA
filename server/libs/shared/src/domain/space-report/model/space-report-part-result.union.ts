import { SpaceReportPartResult } from '@shared/domain/space-report/model/space-report-part-result'
import { SpaceReportPartSourceType } from '@shared/domain/space-report/model/space-report-part-source.type'

export type SpaceReportPartResultUnion = {
  [K in SpaceReportPartSourceType]: SpaceReportPartResult<K>
}[SpaceReportPartSourceType]
