import { entityTypeToEntityMap } from '@shared/domain/entity/domain/entity-type-to-entity.map'
import { SpaceReportPartSourceType } from './space-report-part-source.type'

export interface SpaceReportPartSourceEntity<T extends SpaceReportPartSourceType> {
  type: T
  entity: InstanceType<typeof entityTypeToEntityMap[T]>
}
