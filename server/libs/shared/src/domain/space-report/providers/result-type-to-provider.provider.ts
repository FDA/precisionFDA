import { Provider } from '@nestjs/common'
import { SpaceReportFormat } from '@shared/domain/space-report/model/space-report-format'
import { SpaceReportResultHtmlProvider } from '@shared/domain/space-report/service/result/space-report-result-html.provider'
import { SpaceReportResultJsonProvider } from '@shared/domain/space-report/service/result/space-report-result-json.provider'
import { SpaceReportResultProvider } from '@shared/domain/space-report/service/result/space-report-result.provider'

export const SPACE_REPORT_RESULT_TYPE_TO_PROVIDER_MAP = 'SPACE_REPORT_RESULT_TYPE_TO_PROVIDER_MAP'

export const resultTypeToProviderProvider: Provider = {
  provide: SPACE_REPORT_RESULT_TYPE_TO_PROVIDER_MAP,
  inject: [SpaceReportResultHtmlProvider, SpaceReportResultJsonProvider],
  useFactory: (HTML: SpaceReportResultHtmlProvider, JSON: SpaceReportResultJsonProvider) =>
    ({
      HTML,
      JSON,
    }) satisfies { [T in SpaceReportFormat]: SpaceReportResultProvider<T> },
}
