import { IsValidDxid } from '@shared/domain/entity/constraint/is-dxid-valid.constraint'
import { DxId } from '@shared/domain/entity/domain/dxid'

export class JobActionDTO {
  @IsValidDxid({ entityType: 'job' })
  dxid: DxId<'job'>
}
