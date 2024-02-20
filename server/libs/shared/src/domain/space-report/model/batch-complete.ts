import { SpaceReportPartResultUnion } from '@shared/domain/space-report/model/space-report-part-result.union'

export interface BatchComplete {
  id: number
  result: SpaceReportPartResultUnion
}
