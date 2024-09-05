import { Provider } from '@nestjs/common'
import { SpaceReportPartSourceType } from '@shared/domain/space-report/model/space-report-part-source.type'
import { SpaceReportPartAppResultProvider } from '@shared/facade/space-report/service/space-report-part-app-result-provider.service'
import { SpaceReportPartAssetResultProvider } from '@shared/facade/space-report/service/space-report-part-asset-result-provider.service'
import { SpaceReportPartDiscussionResultProviderService } from '@shared/facade/space-report/service/space-report-part-discussion-result-provider.service'
import { SpaceReportPartFileResultProvider } from '@shared/facade/space-report/service/space-report-part-file-result-provider.service'
import { SpaceReportPartJobResultProvider } from '@shared/facade/space-report/service/space-report-part-job-result-provider.service'
import { SpaceReportPartResultProvider } from '@shared/facade/space-report/service/space-report-part-result.provider'
import { SpaceReportPartUserResultProvider } from '@shared/facade/space-report/service/space-report-part-user-result-provider.service'
import { SpaceReportPartWorkflowResultProvider } from '@shared/facade/space-report/service/space-report-part-workflow-result-provider.service'

export const SOURCE_TYPE_TO_RESULT_PROVIDER_MAP = 'SOURCE_TYPE_TO_META_PROVIDER_MAP'

export const sourceTypeToResultProviderMapProvider: Provider = {
  provide: SOURCE_TYPE_TO_RESULT_PROVIDER_MAP,
  inject: [
    SpaceReportPartAppResultProvider,
    SpaceReportPartAssetResultProvider,
    SpaceReportPartFileResultProvider,
    SpaceReportPartJobResultProvider,
    SpaceReportPartWorkflowResultProvider,
    SpaceReportPartUserResultProvider,
    SpaceReportPartDiscussionResultProviderService,
  ],
  useFactory: (app, asset, file, job, workflow, user, discussion) =>
    ({ app, asset, file, job, workflow, user, discussion }) satisfies {
      [T in SpaceReportPartSourceType]: SpaceReportPartResultProvider<T>
    },
}
