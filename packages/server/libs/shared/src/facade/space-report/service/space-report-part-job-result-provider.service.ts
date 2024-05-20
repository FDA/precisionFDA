import { Injectable } from '@nestjs/common'
import { Job } from '@shared/domain/job/job.entity'
import { SpaceReportPartProvenanceTreeResultMeta } from '@shared/domain/space-report/model/space-report-part-provenance-tree-result-meta'
import { SpaceReportPartProvenanceTreeResultProvider } from './space-report-part-provenance-tree-result.provider'

@Injectable()
export class SpaceReportPartJobResultProvider extends SpaceReportPartProvenanceTreeResultProvider<'job'> {
  protected type = 'job' as const

  protected getMeta(entity: Job): SpaceReportPartProvenanceTreeResultMeta {
    return {
      title: entity.name,
      created: entity.createdAt,
    }
  }
}
