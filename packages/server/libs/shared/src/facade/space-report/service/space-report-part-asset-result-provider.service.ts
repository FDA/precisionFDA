import { Injectable } from '@nestjs/common'
import { SpaceReportPartProvenanceTreeResultMeta } from '@shared/domain/space-report/model/space-report-part-provenance-tree-result-meta'
import { Asset } from '@shared/domain/user-file/asset.entity'
import { SpaceReportPartProvenanceTreeResultProvider } from './space-report-part-provenance-tree-result.provider'

@Injectable()
export class SpaceReportPartAssetResultProvider extends SpaceReportPartProvenanceTreeResultProvider<'asset'> {
  protected type = 'asset' as const

  protected getMeta(entity: Asset): SpaceReportPartProvenanceTreeResultMeta {
    return {
      title: entity.name,
      created: entity.createdAt,
    }
  }
}
