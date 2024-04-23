import { SpaceReportFormat } from '@shared/domain/space-report/model/space-report-format'
import { SpaceReportPartResultUnion } from '@shared/domain/space-report/model/space-report-part-result.union'

export interface BatchComplete<F extends SpaceReportFormat = SpaceReportFormat> {
  id: number
  result: SpaceReportPartResultUnion<F>
}
