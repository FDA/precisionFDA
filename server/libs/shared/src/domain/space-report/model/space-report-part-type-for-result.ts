import { SpaceReportPartTypeToResultMap } from '@shared/domain/space-report/model/space-report-part-type-to-result.map'

export type SpaceReportPartTypeForResult<T> = {
  [K in keyof SpaceReportPartTypeToResultMap]: SpaceReportPartTypeToResultMap[K] extends T
    ? K
    : never
}[keyof SpaceReportPartTypeToResultMap]
