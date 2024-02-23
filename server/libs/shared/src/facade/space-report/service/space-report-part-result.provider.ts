import { entityTypeToEntityMap } from '@shared/domain/entity/domain/entity-type-to-entity.map'
import { SpaceReportPartResult } from '@shared/domain/space-report/model/space-report-part-result'
import { SpaceReportPartSourceType } from '@shared/domain/space-report/model/space-report-part-source.type'
import { Space } from '@shared/domain/space/space.entity'

export interface SpaceReportPartResultProvider<T extends SpaceReportPartSourceType> {
  getResult(
    entity: InstanceType<(typeof entityTypeToEntityMap)[T]>,
    space: Space,
  ): Promise<SpaceReportPartResult<T>>
}
