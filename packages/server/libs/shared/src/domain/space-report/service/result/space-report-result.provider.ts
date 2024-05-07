import { SpaceReportPart } from '@shared/domain/space-report/entity/space-report-part.entity'
import { SpaceReport } from '@shared/domain/space-report/entity/space-report.entity'
import { SpaceReportFormat } from '@shared/domain/space-report/model/space-report-format'
import { SpaceReportFormatToResultOptionsMap } from '@shared/domain/space-report/model/space-report-format-to-result-options.map'
import { SpaceReportPartSourceType } from '@shared/domain/space-report/model/space-report-part-source.type'
import { Space } from '@shared/domain/space/space.entity'
import { User } from '@shared/domain/user/user.entity'

type SpaceReportPartSourceMap<F extends SpaceReportFormat> = {
  [K in SpaceReportPartSourceType]: SpaceReportPart<K, F>[]
}

export abstract class SpaceReportResultProvider<F extends SpaceReportFormat> {
  abstract provide(
    report: SpaceReport<F>,
    options: SpaceReportFormatToResultOptionsMap[F],
  ): Promise<string>

  protected getReportPartsMap(spaceReport: SpaceReport<F>) {
    return spaceReport.reportParts.getItems().reduce<SpaceReportPartSourceMap<F>>(
      <T extends SpaceReportPartSourceType>(
        acc: SpaceReportPartSourceMap<F>,
        rp: SpaceReportPart<T, F>,
      ) => {
        acc[rp.sourceType].push(rp)
        return acc
      },
      { app: [], file: [], job: [], asset: [], workflow: [], user: [], discussion: [] },
    )
  }

  protected getTitleText(user: User, space?: Space) {
    if (!space) {
      return `Private area of user ${user.fullName}`
    }

    if (space.isConfidentialReviewerSpace()) {
      return `${space.name} (Reviewer side)`
    }

    if (space.isConfidentialSponsorSpace()) {
      return `${space.name} (Sponsor side)`
    }

    return space.name
  }
}
