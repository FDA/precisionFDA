import { IsValidUid } from '@shared/domain/entity/constraint/is-uid-valid.constraint'
import { IsValidScope } from '@shared/domain/entity/constraint/is-valid-scope.constraint'
import { Uid } from '@shared/domain/entity/domain/uid'
import { EntityScope } from '@shared/types/common'

export class FilesValidateCopyingBodyDto {
  @IsValidUid({ entityType: 'file', each: true })
  uids: Uid<'file'>[]
  @IsValidScope({ allowPublic: false })
  scope: EntityScope
}
