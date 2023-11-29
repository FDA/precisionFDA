import { entityTypeToEntityMap } from '../../entity'
import { SpaceReportPartSourceType } from './space-report-part-source.type'

export interface SpaceReportPartSourceEntity<T extends SpaceReportPartSourceType> {
  type: T
  entity: InstanceType<typeof entityTypeToEntityMap[T]>
}
