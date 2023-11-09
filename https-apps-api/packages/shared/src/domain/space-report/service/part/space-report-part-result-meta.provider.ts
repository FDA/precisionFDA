import { entityTypeToEntityMap } from '../../../entity'
import { SpaceReportPartResultMeta } from '../../model/space-report-part-result-meta'
import { SpaceReportPartSourceType } from '../../model/space-report-part-source.type'

export interface SpaceReportPartResultMetaProvider<T extends SpaceReportPartSourceType> {
  getResultMeta(entity: InstanceType<typeof entityTypeToEntityMap[T]>): SpaceReportPartResultMeta
}
