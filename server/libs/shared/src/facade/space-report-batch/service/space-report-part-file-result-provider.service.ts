import { Injectable } from '@nestjs/common'
import { SpaceReportPartProvenanceTreeResultMeta } from '@shared/domain/space-report/model/space-report-part-provenance-tree-result-meta'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { SpaceReportPartProvenanceTreeResultProvider } from './space-report-part-provenance-tree-result.provider'

@Injectable()
export class SpaceReportPartFileResultProvider extends SpaceReportPartProvenanceTreeResultProvider<'file'> {
  protected type = 'file' as const

  protected getMeta(entity: UserFile): SpaceReportPartProvenanceTreeResultMeta {
    return {
      title: entity.name,
      created: entity.createdAt,
    }
  }
}
