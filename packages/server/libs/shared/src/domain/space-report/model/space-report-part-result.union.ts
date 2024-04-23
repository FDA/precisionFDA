import { SpaceReportFormat } from '@shared/domain/space-report/model/space-report-format'
import { SpaceReportPartResult } from '@shared/domain/space-report/model/space-report-part-result'
import { SpaceReportPartSourceType } from '@shared/domain/space-report/model/space-report-part-source.type'

export type SpaceReportPartResultUnion<F extends SpaceReportFormat> = {
  [K in SpaceReportPartSourceType]: SpaceReportPartResult<K, F>
}[SpaceReportPartSourceType]
