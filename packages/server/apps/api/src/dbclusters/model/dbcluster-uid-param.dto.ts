import { IsValidUid } from '@shared/domain/entity/constraint/is-uid-valid.constraint'
import { Uid } from '@shared/domain/entity/domain/uid'

export class DbClusterUidParamDto {
  @IsValidUid({ entityType: 'dbcluster' })
  dbclusterUid: Uid<'dbcluster'>
}
