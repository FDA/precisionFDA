import { App } from '../../../app'
import { SpaceReportPartResultMeta } from '../../model/space-report-part-result-meta'
import { SpaceReportPartResultMetaProvider } from './space-report-part-result-meta.provider'

export class SpaceReportPartAppResultMetaProvider implements SpaceReportPartResultMetaProvider<'app'> {
  getResultMeta(entity: App): SpaceReportPartResultMeta {
    return {
      title: entity.title,
      created: entity.createdAt,
    }
  }
}
