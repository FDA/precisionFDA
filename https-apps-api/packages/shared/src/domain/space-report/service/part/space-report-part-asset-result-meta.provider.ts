import { Asset } from '../../../user-file'
import { SpaceReportPartResultMeta } from '../../model/space-report-part-result-meta'
import { SpaceReportPartResultMetaProvider } from './space-report-part-result-meta.provider'

export class SpaceReportPartAssetResultMetaProvider implements SpaceReportPartResultMetaProvider<'asset'> {
  getResultMeta(entity: Asset): SpaceReportPartResultMeta {
    return {
      title: entity.name,
      created: entity.createdAt,
    }
  }
}
