import { SpaceReportFormatToResultOptionsMap } from '@shared/domain/space-report/model/space-report-format-to-result-options.map'

export type SpaceReportFormat = keyof SpaceReportFormatToResultOptionsMap

export const allowedSpaceReportFormats: SpaceReportFormat[] = ['HTML', 'JSON']
