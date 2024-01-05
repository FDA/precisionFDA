import { Injectable } from '@nestjs/common'
import { Asset } from '@shared/domain'
import { SpaceReportPartResultMeta } from '../../model/space-report-part-result-meta'
import { SpaceReportPartResultMetaProvider } from './space-report-part-result-meta.provider'

@Injectable()
export class SpaceReportPartAssetResultMetaProvider
  implements SpaceReportPartResultMetaProvider<'asset'>
{
  getResultMeta(entity: Asset): SpaceReportPartResultMeta {
    return {
      title: entity.name,
      created: entity.createdAt,
    }
  }
}
