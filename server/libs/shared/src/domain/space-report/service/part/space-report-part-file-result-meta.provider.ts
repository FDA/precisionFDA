import { Injectable } from '@nestjs/common'
import { UserFile } from '@shared/domain'
import { SpaceReportPartResultMeta } from '../../model/space-report-part-result-meta'
import { SpaceReportPartResultMetaProvider } from './space-report-part-result-meta.provider'

@Injectable()
export class SpaceReportPartFileResultMetaProvider
  implements SpaceReportPartResultMetaProvider<'file'>
{
  getResultMeta(entity: UserFile): SpaceReportPartResultMeta {
    return {
      title: entity.name,
      created: entity.createdAt,
    }
  }
}
