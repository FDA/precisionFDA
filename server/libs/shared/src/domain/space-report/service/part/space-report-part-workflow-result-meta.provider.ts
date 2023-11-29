import { Workflow } from '../../../workflow'
import { SpaceReportPartResultMeta } from '../../model/space-report-part-result-meta'
import { SpaceReportPartResultMetaProvider } from './space-report-part-result-meta.provider'

export class SpaceReportPartWorkflowResultMetaProvider implements SpaceReportPartResultMetaProvider<'workflow'> {
  getResultMeta(entity: Workflow): SpaceReportPartResultMeta {
    return {
      title: entity.name,
      created: entity.createdAt,
    }
  }
}
