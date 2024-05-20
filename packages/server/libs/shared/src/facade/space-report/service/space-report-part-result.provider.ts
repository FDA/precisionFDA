import { EntityInstance } from '@shared/domain/entity/domain/entity-instance'
import { SpaceReportFormat } from '@shared/domain/space-report/model/space-report-format'
import { SpaceReportPartResult } from '@shared/domain/space-report/model/space-report-part-result'
import { SpaceReportPartSourceType } from '@shared/domain/space-report/model/space-report-part-source.type'
import { Space } from '@shared/domain/space/space.entity'

export abstract class SpaceReportPartResultProvider<T extends SpaceReportPartSourceType> {
  protected abstract getJsonResult(
    entity: EntityInstance<T>,
    space: Space,
  ): Promise<SpaceReportPartResult<T, 'JSON'>>

  protected abstract getHtmlResult(
    entity: EntityInstance<T>,
    space: Space,
  ): Promise<SpaceReportPartResult<T, 'HTML'>>

  getResult<F extends SpaceReportFormat>(
    entity: EntityInstance<T>,
    space: Space,
    format: F,
  ): Promise<SpaceReportPartResult<T, F>> {
    return this.formatFunctionMap[format](entity, space) as Promise<SpaceReportPartResult<T, F>>
  }

  private formatFunctionMap: {
    [F in SpaceReportFormat]: (
      entity: EntityInstance<T>,
      space: Space,
    ) => Promise<SpaceReportPartResult<T, F>>
  } = {
    JSON: (e, s) => this.getJsonResult(e, s),
    HTML: (e, s) => this.getHtmlResult(e, s),
  }
}
