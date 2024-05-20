import { Injectable } from '@nestjs/common'
import { App } from '@shared/domain/app/app.entity'
import { SpaceReportPartProvenanceTreeResultMeta } from '@shared/domain/space-report/model/space-report-part-provenance-tree-result-meta'
import { SpaceReportPartProvenanceTreeResultProvider } from './space-report-part-provenance-tree-result.provider'

@Injectable()
export class SpaceReportPartAppResultProvider extends SpaceReportPartProvenanceTreeResultProvider<'app'> {
  protected type = 'app' as const

  protected getMeta(entity: App): SpaceReportPartProvenanceTreeResultMeta {
    let title = entity.title

    if (entity.revision != null) {
      title += ` (revision ${entity.revision})`
    }

    return {
      title,
      created: entity.createdAt,
    }
  }
}
