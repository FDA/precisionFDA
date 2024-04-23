import { entityTypeToEntityMap } from '@shared/domain/entity/domain/entity-type-to-entity.map'
import { SpaceReportFormat } from '@shared/domain/space-report/model/space-report-format'
import { SpaceReportPartResult } from '@shared/domain/space-report/model/space-report-part-result'
import { SpaceReportPartSourceType } from '@shared/domain/space-report/model/space-report-part-source.type'
import { Space } from '@shared/domain/space/space.entity'

export abstract class SpaceReportPartResultProvider<T extends SpaceReportPartSourceType> {
  protected abstract getJsonResult(
    entity: InstanceType<(typeof entityTypeToEntityMap)[T]>,
    space: Space,
  ): Promise<SpaceReportPartResult<T, 'JSON'>>

  protected abstract getHtmlResult(
    entity: InstanceType<(typeof entityTypeToEntityMap)[T]>,
    space: Space,
  ): Promise<SpaceReportPartResult<T, 'HTML'>>

  getResult<F extends SpaceReportFormat>(
    entity: InstanceType<(typeof entityTypeToEntityMap)[T]>,
    space: Space,
    format: F,
  ): Promise<SpaceReportPartResult<T, F>> {
    return this.formatFunctionMap[format](entity, space) as Promise<SpaceReportPartResult<T, F>>
  }

  private formatFunctionMap: {
    [F in SpaceReportFormat]: (
      entity: InstanceType<(typeof entityTypeToEntityMap)[T]>,
      space: Space,
    ) => Promise<SpaceReportPartResult<T, F>>
  } = {
    JSON: (e, s) => this.getJsonResult(e, s),
    HTML: (e, s) => this.getHtmlResult(e, s),
  }
}
