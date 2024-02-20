import { Injectable } from '@nestjs/common'
import { SpaceReportPartProvenanceTreeResultMeta } from '@shared/domain/space-report/model/space-report-part-provenance-tree-result-meta'
import { Workflow } from '@shared/domain/workflow/entity/workflow.entity'
import { SpaceReportPartProvenanceTreeResultProvider } from './space-report-part-provenance-tree-result.provider'

@Injectable()
export class SpaceReportPartWorkflowResultProvider extends SpaceReportPartProvenanceTreeResultProvider<'workflow'> {
  protected type = 'workflow' as const

  protected getMeta(entity: Workflow): SpaceReportPartProvenanceTreeResultMeta {
    return {
      title: entity.name,
      created: entity.createdAt,
    }
  }
}
