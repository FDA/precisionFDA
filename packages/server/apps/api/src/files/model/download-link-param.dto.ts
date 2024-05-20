import { IsValidUid } from '@shared/domain/entity/constraint/is-uid-valid.constraint'
import { UId } from '@shared/domain/entity/domain/uid'

export class DownloadLinkParamDto {
  @IsValidUid('file')
  uid: UId<'file'>
}
