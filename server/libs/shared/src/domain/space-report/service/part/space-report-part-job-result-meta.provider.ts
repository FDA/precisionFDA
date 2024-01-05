import { Injectable } from '@nestjs/common'
import { Job } from '../../../job'
import { SpaceReportPartResultMeta } from '../../model/space-report-part-result-meta'
import { SpaceReportPartResultMetaProvider } from './space-report-part-result-meta.provider'

@Injectable()
export class SpaceReportPartJobResultMetaProvider
  implements SpaceReportPartResultMetaProvider<'job'>
{
  getResultMeta(entity: Job): SpaceReportPartResultMeta {
    return {
      title: entity.name,
      created: entity.createdAt,
    }
  }
}
