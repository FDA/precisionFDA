import { IsValidUid } from '@shared/domain/entity/constraint/is-uid-valid.constraint'
import { Uid } from '@shared/domain/entity/domain/uid'

export class DownloadLinkParamDto {
  @IsValidUid({ entityType: 'file' })
  uid: Uid<'file'>
}
