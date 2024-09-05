import { Inject, Injectable } from '@nestjs/common'
import { SpaceReport } from '@shared/domain/space-report/entity/space-report.entity'
import { SpaceReportFormat } from '@shared/domain/space-report/model/space-report-format'
import { SpaceReportFormatToResultOptionsMap } from '@shared/domain/space-report/model/space-report-format-to-result-options.map'
import { SPACE_REPORT_RESULT_TYPE_TO_PROVIDER_MAP } from '@shared/domain/space-report/providers/result-type-to-provider.provider'
import { SpaceReportResultProvider } from '@shared/domain/space-report/service/result/space-report-result.provider'

@Injectable()
export class SpaceReportResultService {
  constructor(
    @Inject(SPACE_REPORT_RESULT_TYPE_TO_PROVIDER_MAP)
    private readonly typeToProviderMap: { [T in SpaceReportFormat]: SpaceReportResultProvider<T> },
  ) {}

  generateResult<T extends SpaceReportFormat>(
    report: SpaceReport<T>,
    opts?: SpaceReportFormatToResultOptionsMap[T],
  ): Promise<string> {
    return this.typeToProviderMap[report.format].provide(report, opts)
  }
}
