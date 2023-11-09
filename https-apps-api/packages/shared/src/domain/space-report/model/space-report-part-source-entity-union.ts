import { SpaceReportPartSourceEntity } from './space-report-part-source-entity'
import { SpaceReportPartSourceType } from './space-report-part-source.type'

export type SpaceReportPartSourceEntityUnion = {
  [T in SpaceReportPartSourceType]: SpaceReportPartSourceEntity<T>
}[SpaceReportPartSourceType]
