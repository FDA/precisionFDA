import { Injectable } from '@nestjs/common'
import { SpaceReport } from '@shared/domain/space-report/entity/space-report.entity'
import { SpaceReportResultProvider } from '@shared/domain/space-report/service/result/space-report-result.provider'

@Injectable()
export class SpaceReportResultJsonProvider extends SpaceReportResultProvider<'JSON'> {
  async provide(spaceReport: SpaceReport<'JSON'>) {
    const result = {
      createdAt: spaceReport.createdAt,
      createdBy: spaceReport.createdBy.getEntity().fullName,
      space: {
        id: spaceReport.space.id,
        title: this.getSpaceTitleText(spaceReport.space),
        description: spaceReport.space.description,
        entities: this.getEntities(spaceReport),
      },
    }

    if (spaceReport.options.prettyPrint) {
      return JSON.stringify(result, null, 2)
    }

    return JSON.stringify(result)
  }

  private getEntities(spaceReport: SpaceReport<'JSON'>) {
    const parts = this.getReportPartsMap(spaceReport)

    return Object.entries(parts).reduce((acc, [sourceType, parts]) => {
      acc[`${sourceType}s`] = parts.map((part) => part.result)
      return acc
    }, {})
  }
}
