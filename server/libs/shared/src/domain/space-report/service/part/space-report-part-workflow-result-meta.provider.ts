import { Injectable } from '@nestjs/common'
import { Workflow } from '@shared/domain/workflow/entity/workflow.entity'
import { SpaceReportPartResultMeta } from '../../model/space-report-part-result-meta'
import { SpaceReportPartResultMetaProvider } from './space-report-part-result-meta.provider'

@Injectable()
export class SpaceReportPartWorkflowResultMetaProvider
  implements SpaceReportPartResultMetaProvider<'workflow'>
{
  getResultMeta(entity: Workflow): SpaceReportPartResultMeta {
    return {
      title: entity.name,
      created: entity.createdAt,
    }
  }
}
