import { SpaceReportCreateJsonOptionsDto } from '@shared/domain/space-report/model/space-report-create-json-options.dto'
import { SpaceReportFormat } from '@shared/domain/space-report/model/space-report-format'

export const spaceReportFormatToOptionsDtoMap = {
  JSON: SpaceReportCreateJsonOptionsDto,
  HTML: null as null,
} satisfies Record<SpaceReportFormat, (new () => object) | never>

export type SpaceReportFormatToOptionsMap = {
  [K in keyof typeof spaceReportFormatToOptionsDtoMap]: (typeof spaceReportFormatToOptionsDtoMap)[K] extends new () => infer R
    ? R
    : (typeof spaceReportFormatToOptionsDtoMap)[K]
}
